"use strict";
const express = require("express");
const functions = require("firebase-functions");
const axios = require('axios');
const router = express.Router();
const ngrok = require('ngrok');
const nodemailer = require('nodemailer');
const mg = require("nodemailer-mailgun-transport")
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")
const crypto = require('crypto');
const {adminApp, db, admin} = require("../../../../config/config");
const {freeTrial} = require('../../../../maytapi/trial');

const INSTANCE_URL = 'https://api.maytapi.com/api';
const ngrokAuthToken = functions.config().ngrok.auth_token
const PORT = process.env.PORT || 4000;

const sendVerificationEmailAdmin = (email, name, link) => {
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, "/emails/admin.hbs"), "utf8");
    const mailgunAuth = {
        auth: {
            api_key: functions.config().mailgun.api_key,
            domain: functions.config().mailgun.live_domain
        }
    }

    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth))
    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
        name: name,
        link: link
    })
    const mailOptions = {
        from: "sauce@sauceflow.com",
        to: email,
        subject: "Sauceflow WhatsApp CRM - Please confirm your email address",
        html: htmlToSend
    }

    smtpTransport.sendMail(mailOptions, (err, res) => {
        if (err) {
            console.log(`mailgun admin email to ${email} errored out >>`, err)
        } else {
            console.log('the admin email was sent!')
        }
    })
}

const sendVerificationEmailAgent = (email, name, company, link) => {
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, "/emails/agent.hbs"), "utf8");
    const mailgunAuth = {
        auth: {
            api_key: functions.config().mailgun.api_key,
            domain: functions.config().mailgun.live_domain
        }
    }

    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth))
    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
        name: name,
        company: company,
        link: link
    })
    const mailOptions = {
        from: "sauce@sauceflow.com",
        to: email,
        subject: "Sauceflow WhatsApp CRM - Please confirm your email address",
        html: htmlToSend
    }

    smtpTransport.sendMail(mailOptions, (err, res) => {
        if (err) {
            console.log(`mailgun agent email to ${email} errored out >>`, err)
        } else {
            console.log('the agent email was sent!')
        }
    })
}

const trialNetwork = async (productId, token, tunnel) => {
    try {
        const publicUrl = await ngrok.connect({
            authtoken: ngrokAuthToken,
            subdomain: tunnel,
            addr: PORT,
            inspect: false,
        })
        let webhookUrl = `${publicUrl}/api/v0/message/webhook`
        let url = `${INSTANCE_URL}/${productId}/setWebhook`
        axios.post(url, {webhook: webhookUrl}, {
            headers: {
                'Content-Type': 'application/json',
                'x-maytapi-key': token
            }
        })
            .then(res => console.log('trial connected'))
            .catch(err => console.log('error on free trial webhook endpoint >>', err))
    } catch (err) {
        console.error('Error while connecting Ngrok to whatsapp', err);
        return new Error('Ngrok-Maytapi connection Failed');
    }
}

const addTrialNumber = async (number, productId, token) => {
    let url = `${INSTANCE_URL}/${productId}/addPhone`
    try {
        let response = await axios.post(url, {"number": number}, {
            headers: {
                'Content-Type': 'application/json',
                'x-maytapi-key': token
            }
        })
        return response.data
    } catch (err) {
        console.log('an error occurred when setting adding a new phone >>', err)
    }
}


//test
//CHECK BELOW THE ROUTER EXPORTS

router.post('/', async (req, res) => {
    //create a new user, add it to the db users list for the company and send them a mail to auth
    let {newAgentEmail, newAgentName, companyid} = req.body.newUserData;
    let agentFirstName = newAgentName.split(" ")[0]
    let companyName;
    let currentAgentCount;
    let totalAgentLimit;
    let snapshot = await db.collection('companies').doc(companyid).get();
    if (snapshot) {
        companyName = snapshot.data().name
        currentAgentCount = snapshot.data().agentCount
        totalAgentLimit = snapshot.data().agentLimit
    }
    let company = companyName.replace("__", " ").toUpperCase()

    //check if this company can add new users or need to increase the subscription
    if (currentAgentCount < totalAgentLimit) {
        let companyRef = db.collection('companies').doc(companyid).collection('users');
        adminApp
            .auth()
            .createUser({
                email: newAgentEmail,
                password: 'password' //default password
            })
            .then(async user => {
                let newAgentId = user.uid
                //send verification link
                adminApp
                    .auth()
                    .generateEmailVerificationLink(newAgentEmail)
                    .then(link => {
                        return sendVerificationEmailAgent(newAgentEmail, agentFirstName, company, link)
                    })
                    .catch((error) => {
                        console.log('error occurred when sending verification email to the agent', error)
                    });
                //add to general agents
                await db.collection('allagents').add({
                    agentId: newAgentId,
                    companyId: companyid
                })

                //add to company users list (check to see the subscription status of this admin and send an error messsage if they have not paid for a plan)
                await companyRef.doc(newAgentId).set({ //this will add the new agent with a custom id which is the user id
                    name: newAgentName,
                    role: 'Agent',
                    email: newAgentEmail,
                    loggedin: "No",
                    status: "Pending",
                    activeAgent: false
                })

                //increase the agent count
                const updateCount = await db.collection('companies').doc(companyid).update({
                    agentCount: admin.firestore.FieldValue.increment(1)
                })

                res.status(200).send('New user was created successfully')
            })
            .catch((error) => {
                res.status(400).send(error.message)
            });
    } else {
        res.status(403).send('Please make a new subscription to add more agents')
    }
})

router.post('/admin', async (req, res) => {
    const {email, name, phoneNumber, companyId} = req.body;
    let firstName = name.split(" ")[0]
    try {
        //send verification link
        adminApp
            .auth()
            .generateEmailVerificationLink(email)
            .then(link => {
                return sendVerificationEmailAdmin(email, firstName, link)
            })
            .catch(error => {
                console.log('error occurred when sending verification email to the admin', error)
            });

        //sign up on maytapi for free trial - 3 agents for 2 days
        let pseudoName = name.replace(" ", "__")
        let trialEmail = `${pseudoName}@gmail.com`
        const trialPassword = crypto.randomBytes(8).toString('hex');
        let trialData = await freeTrial(trialEmail, trialPassword);

        //trial data response received from maytapi
        const {productId, token} = trialData

        //add a phone
        let phoneData = await addTrialNumber(phoneNumber, productId, token)

        //add to trials collection
        const registerDate = new Date(new Date()).getTime()
        const twoDays = 48 * 60 * 60 * 1000 //48 hours in milliseconds
        const freeTrialEnd = registerDate + twoDays;
        const trialId = await db.collection('companies').doc(companyId).collection('trial').add({
            productId: productId,
            token: token,
            number: phoneNumber,
            phoneId: phoneData.id,
            email: email,
            trialPassword: trialPassword,
            trialEmail: trialEmail,
            trialStart: registerDate,
            trialEnd: freeTrialEnd
        })
            .then(doc => {
                res.status(200).send({trial: doc.id})
            })
            .catch(err => {
                console.log("Error adding document: ", err);
            })
    } catch (err) {
        console.log('err in free trial registration stage', err)
    }
})

exports.UserRouter = router;
exports.trialNetwork = trialNetwork;

