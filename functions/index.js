const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const {db} = require("./src/config/config");


const {IndexRouter} = require('./src/controllers/v0/index.router');
const {setupWhatsAppNetwork} = require('./src/controllers/v0/messages/routes/message.router');
const {setupFlutterNetwork} = require('./src/controllers/v0/payments/routes/payments.router');
const {trialNetwork} = require('./src/controllers/v0/users/routes/users.router');

const app = express();

const trialRemainder = (endingDate) => {
    let remainder = endingDate - new Date(new Date()).getTime() //milliseconds
    let toHours = 1000 * 60 * 60
    return Math.floor(remainder / toHours)
}

(async () => {
    //set up a network for each company
    const companiesRef = await db.collection('companies');
    companiesRef.onSnapshot(async snapshot => {
        //check if the company has a trial collection
        snapshot.docs.forEach(async (company, index) => {
            let tunnel = 'No'
            const {id} = company
            let trialSnapshot = await companiesRef.doc(id).collection('trial').limit(1).get()
            if (trialSnapshot.empty) {//trial has ended
                //check if the company has paid. if not, have a listener in case they pay later
                let tunnelName = `sauceflow-messages${index}`
                const paidUser = companiesRef.doc(id)
                paidUser.onSnapshot(docSnapshot => {
                    const {token, productID, phoneID} = docSnapshot.data()
                    if (token && productID && phoneID) {
                        //put a listener on its agents for when they go online
                        const onlineUsers = companiesRef.doc(id).collection('users').where('loggedin', '==', 'Yes').limit(1)
                        onlineUsers.onSnapshot(async querySnapshot => {
                            const size = querySnapshot.size
                            if ((size === 1) && (tunnel === 'No')) {
                                tunnel = 'Yes'
                                await setupWhatsAppNetwork(productID, token, tunnelName)
                            }

                            if ((size === 0) && (tunnel === 'Yes')) {
                                tunnel = 'No'
                                const ngrok = require('ngrok');
                                await ngrok.disconnect(`https://${tunnelName}.ngrok.io`)
                                await ngrok.disconnect(`http://${tunnelName}.ngrok.io`)
                            }
                        }, error => {
                            console.log(`Encountered error with the online users: ${error}`);
                        })
                    }
                }, err => {
                    console.log('Encountered error in the paid users listener', err)
                })
            } else {//still got free trial
                let trialUser = trialSnapshot.docs.map(doc => doc.data())
                let trialTunnel = `sauceflow-trial${index}`
                trialUser.forEach(userObj => {
                    const {token, productId, phoneId} = userObj
                    if (token && productId && phoneId) {
                        const onlineUsers = companiesRef.doc(id).collection('users').where('loggedin', '==', 'Yes').limit(1)
                        onlineUsers.onSnapshot(async querySnapshot => {
                            const size = querySnapshot.size
                            if ((size === 1) && (tunnel === 'No')) {
                                tunnel = 'Yes'
                                await trialNetwork(productId, token, trialTunnel)
                            }

                            if ((size === 0) && (tunnel === 'Yes')) {
                                tunnel = 'No'
                                const ngrok = require('ngrok');
                                await ngrok.disconnect(`https://${trialTunnel}.ngrok.io`)
                                await ngrok.disconnect(`http://${trialTunnel}.ngrok.io`)
                            }
                        }, error => {
                            console.log(`Encountered error with the trial online users: ${error}`);
                        })
                    }
                })
            }
        })
    })

    //payment update
    await setupFlutterNetwork()
})()

app.use(bodyParser.json());
app.use('/api/v0/', IndexRouter)

app.get('*', (req, res) => {
    res.send('/api/v0/')
})

app.post('*', (req, res) => {
    res.send('/api/v0/')
})

exports.api = functions.https.onRequest(app);

//cron job for trial companies to check if it is 48 hrs
exports.endTrial = functions.pubsub.schedule('0 */1 * * *').onRun(async () => {
    const companiesRef = await db.collection('companies')
    await companiesRef.where('trial', '==', true).onSnapshot(async snapshot => {
        let trials = snapshot.docs.map(doc => doc.id)
        trials.forEach(async coy => {
            let snap = await companiesRef.doc(coy).collection('trial').get()
            if (!snap.empty) {
                snap.forEach(async doc => {
                    let ends = doc.data().trialEnd
                    let id = doc.id
                    let hrsRemaining = trialRemainder(ends)
                    if (hrsRemaining <= 0) {
                        await companiesRef.doc(coy).collection('trial').doc(id).delete()
                        await companiesRef.doc(coy).update({
                            trial: false
                        })
                    }
                })
            }
        })
    })
})


