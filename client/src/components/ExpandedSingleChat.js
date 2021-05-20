import React, {Component} from 'react';
import {withFirebase} from "../firebase/index";
import {withAuthorization} from "../session/index";
import history from "./History";
import {Avatar, Button, IconButton} from "@material-ui/core";
import {AttachFile} from "@material-ui/icons";
import axios from 'axios';
//import { SearchOutlined, MoreVert } from "@material-ui/icons";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import ResponseModal from "./ResponseModal";
import {db, serverTimestamp} from '../firebase';

import "./styles/chat.css";

//whatsapp credentials for sending message
const instanceUrl = process.env.REACT_APP_MAYTAPI_INSTANCE_URL;


class ExpandedSingleChat extends Component {

    constructor(props) {
        super(props)
        this.chatRef = React.createRef();
        this.state = {
            agentMessage: "",
            agentUid: this.props.agentUid,
            customerNum: this.props.selectedCustomer.name,
            companyUid: this.props.secret.decryption(sessionStorage.getItem('iIi')),
            chats: [],
            phoneId: this.props.phoneId,
            showModal: false,
            productID: this.props.productID,
            token: this.props.token
        }
    }

    getAllMessages = (customerId, agentID, coyid) => {
        let messageRef = db.collection('companies').doc(coyid).collection('users').doc(agentID).collection('customers').doc(customerId).collection('messages').orderBy('timestamp', 'asc')
        this.cleanMessageListener = messageRef
            .onSnapshot(snapshot => {
                this.setState({
                    chats: snapshot.docs.map(doc => doc.data())
                })
            })
    }


    componentDidMount() {
        const {companyUid, agentUid} = this.state
        const {secret} = this.props

        //get code from sessionstorage and decrypt - customer id
        let codedcustomerId = sessionStorage.getItem('iio')
        let deCodedcustomerId = secret.decryption(codedcustomerId)
        let customerId = deCodedcustomerId;

        let agentID = agentUid
        if (customerId && agentID && companyUid) {
            this.getAllMessages(customerId, agentID, companyUid)
            this.scrollToBottom()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if ((prevProps.selectedCustomer.name !== this.props.selectedCustomer.name) || (prevProps.agentUid !== this.props.agentUid) || (prevProps.phoneId !== this.props.phoneId) || (prevProps.productID !== this.props.productID) || (prevProps.token !== this.props.token)) { //this condition handles when the agent selects another customer OR if the page is refreshed
            const {companyUid} = this.state
            const {agentUid, secret} = this.props
            //get code from sessionstorage and decrypt - customer id and customer number
            let codedcustomerId = sessionStorage.getItem('iio')
            let deCodedcustomerId = secret.decryption(codedcustomerId)
            let customerId = deCodedcustomerId;

            let codedcustomerName = sessionStorage.getItem('iiI')
            let deCodedcustomerName = secret.decryption(codedcustomerName)
            this.setState({
                customerNum: deCodedcustomerName,
            })

            let agentID = agentUid
            if (customerId && agentID && companyUid) {
                this.getAllMessages(customerId, agentID, companyUid)
            }
            this.setState({
                phoneId: this.props.phoneId,
                productID: this.props.productID,
                token: this.props.token
            })
        }
        this.scrollToBottom()
    }

    getAgentMessage = e => {
        this.setState({
            agentMessage: e.target.value
        })
    }

    closeModal = () => {
        this.setState({
            showModal: false
        })
    }


    saveResponder = (coyid, client, agentid, clientid, agentMessage, agentName, serverTimestamp, phoneId, productID, token) => {
        //for the db
        db.collection('companies').doc(coyid).collection('response')
            .get()
            .then(snapshot => {
                let data = snapshot.docs.map(doc => {
                    return doc.data()
                }).filter(obj => obj.customer === Number(client))

                if (data.length !== 0) { //someone has responded
                    //check who responded
                    let responder = data[0].agentid
                    if (responder === agentid) {
                        this.sendResponse(coyid, agentid, clientid, agentMessage, agentName, serverTimestamp)
                        this.sendMessageToWhatsapp(client, agentMessage, phoneId, productID, token)
                    } else {
                        this.setState({
                            showModal: true
                        })
                    }
                } else {//no one has responded
                    this.sendResponse(coyid, agentid, clientid, agentMessage, agentName, serverTimestamp)
                    this.sendMessageToWhatsapp(client, agentMessage, phoneId, productID, token)
                    db.collection('companies').doc(coyid).collection('response').add({
                        customer: Number(client),
                        agentid: agentid,
                        customerid: clientid
                    })
                }
            })
    }

    sendResponse = (coyid, agentID, id, agentMessage, agentName, serverTimestamp) => {
        db.collection('companies')
            .doc(coyid)
            .collection('users')
            .doc(agentID)
            .collection('customers')
            .doc(id)
            .collection('messages')
            .add({
                message: agentMessage,
                name: agentName,
                timestamp: serverTimestamp
            })
    }

    sendMessageToWhatsapp = (number, message, phoneId, productID, token) => {
        let body = {
            to_number: number,
            message: message,
            type: "text"
        }
        let url = `${instanceUrl}/${productID}/${phoneId}/sendMessage`
        axios.post(url, body, {
            headers: {
                "x-maytapi-key": token
            }
        })
            .then()
            .catch(err => console.log('an error occurred when sending a message with maytapi >>', err))
    }

    submitAgentMessage = async (e) => {
        //send to db, pull from db and show on the screen, in the left bar, and pass to the server
        //to server
        e.preventDefault()
        const {agentMessage, customerNum, companyUid, phoneId, productID, token} = this.state
        const {agentUid, secret} = this.props

        //get code from sessionstorage and decrypt - customer id
        let codedcustomerId = sessionStorage.getItem('iio')
        let deCodedcustomerId = secret.decryption(codedcustomerId)
        let customerId = deCodedcustomerId;
        //agent name
        let codedAgentName = sessionStorage.getItem('iii')
        let deCodedAgentName = secret.decryption(codedAgentName)
        let agentName = deCodedAgentName

        let agentID = agentUid
        //save agent message to db which is automatically shown on the screen
        if (customerId) {
            this.saveResponder(companyUid, customerNum, agentID, customerId, agentMessage, agentName, serverTimestamp, phoneId, productID, token)
        }
        //clear the form
        this.setState({
            agentMessage: ""
        })
    }

    signOut = async () => {
        const {companyUid} = this.state
        const {agentUid} = this.props
        //signout the agent
        if (companyUid && agentUid) {
            let agentSnapshot = await db.collection('companies').doc(companyUid).collection('users').doc(agentUid)
            if (agentSnapshot) {
                await agentSnapshot.update({loggedin: 'No'})
            }
        }

        this.props.firebase.doSignOut()
        sessionStorage.clear()
        history.push('/')
    }

    scrollToBottom = () => {
        this.chatRef.current.scrollIntoView({behavior: "smooth"})
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    messageGroup = (array, agentName) => {

        const dateToMils = (ts) => {
            let dateStr = new Date(ts).toDateString()
            let milliSecs = new Date(dateStr).getTime()
            return milliSecs
        }

        const convertHourToMilli = hr => {
            const ms = 1000 * 60 * 60
            return ms * hr
        }

        let todayMillisecs = new Date(new Date().toDateString()).getTime()


        let today = array.filter(obj => dateToMils(obj.timestamp?.toDate()) === todayMillisecs)
        let yesterday = array.filter(obj => (todayMillisecs - dateToMils(obj.timestamp?.toDate())) === convertHourToMilli(24))

        //messages grouped by date
        let msgGrps = []

        let olderDays = array.filter(obj => (todayMillisecs - dateToMils(obj.timestamp?.toDate())) > convertHourToMilli(24))
        if (olderDays.length > 0) {
            let allDates = []
            for (let obj of olderDays) {
                allDates.push(obj?.timestamp?.toDate()) //if there is an object and if it has a timestamp entry
            }
            //convert to date string
            let dateStrings = allDates.map(date => new Date(date).toDateString())

            //get unique dates
            let uniqueDates = new Set(dateStrings)
            let grp;
            for (let date of uniqueDates) {
                grp = olderDays.filter(obj => date === new Date(obj.timestamp?.toDate()).toDateString())
                msgGrps.push(grp)
            }
        }


        return (
            <div>
                <div className="older__chats">
                    {
                        msgGrps.map((array, i) => (
                            <div key={i} className="this__day">
                                <div className="this__day__header">
                                    <p>{new Date(array[0]?.timestamp?.toDate()).toDateString()}</p>
                                </div>
                                {
                                    array.map((chat, idx) => (
                                        <p key={idx}
                                           className={`chat__message ${chat.name === agentName && "chat__receiver"}`}>
                                            {chat.message}
                                            <span
                                                className="chat__timestamp">{new Date(chat.timestamp?.toDate()).toLocaleTimeString()}</span>
                                        </p>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
                <div className="yesterday__chats">
                    {yesterday.length === 0 ? "" : <div className="yesterday__header"><p>YESTERDAY</p></div>}
                    {
                        yesterday.map((chat, idx) => (
                            <p key={idx} className={`chat__message ${chat.name === agentName && "chat__receiver"}`}>
                                {chat.message}
                                <span
                                    className="chat__timestamp">{new Date(chat.timestamp?.toDate()).toLocaleTimeString()}</span>
                            </p>
                        ))
                    }
                </div>
                <div className="today__chats">
                    {today.length === 0 ? "" : <div className="today__header"><p>TODAY</p></div>}
                    {
                        today.map((chat, idx) => (
                            <p key={idx} className={`chat__message ${chat.name === agentName && "chat__receiver"}`}>
                                {chat.message}
                                <span
                                    className="chat__timestamp">{new Date(chat.timestamp?.toDate()).toLocaleTimeString()}</span>
                            </p>
                        ))
                    }
                </div>
                <div ref={this.chatRef}/>
            </div>
        )
    }

    render() {
        const {agentMessage, customerNum, chats, showModal} = this.state
        //decrypt agent name
        let codedAgentName = sessionStorage.getItem('iii')
        let deCodedAgentName = this.props.secret.decryption(codedAgentName)
        let agentName = deCodedAgentName

        return (
            <div className="singlechat">
                <div className="chat__header">
                    <Avatar/>
                    <div className="chat__headerInfo">
                        <h3>{customerNum}</h3>
                        <p>
                            Last seen{" "}
                            {
                                new Date(chats[chats.length - 1]?.timestamp?.toDate()).toLocaleString()
                            }
                        </p>
                    </div>
                    <div className="chat__headerRight">
                        <Button onClick={this.signOut} variant="outlined">Sign Out</Button>
                        {
                            //<IconButton><SearchOutlined /></IconButton>
                            //<IconButton><MoreVert /></IconButton>
                        }
                    </div>
                </div>
                <div className="chat__body">
                    {
                        this.messageGroup(chats, agentName)
                    }
                </div>
                <div className="chat__footer">
                    <IconButton>
                        <InsertEmoticonIcon/>
                    </IconButton>
                    <IconButton>
                        <AttachFile/>
                    </IconButton>
                    <form>
                        <input value={agentMessage} autoComplete="off" onChange={this.getAgentMessage}
                               placeholder=" Type a message" type="text"/>
                        <button type="submit" onClick={this.submitAgentMessage}>Send</button>
                    </form>
                    <IconButton>
                        <MicIcon/>
                    </IconButton>
                </div>
                {
                    <ResponseModal title="Notice" showModal={showModal} onClose={this.closeModal}>
                        <p>An agent already responded to this customer!</p>
                    </ResponseModal>
                }
            </div>
        )
    }
}

const condition = authUser => authUser != null
//condition is a function (which was predefined as an argument in
//private/withAuthorization.js) and it checks if the authUser is not null
//if it is null, it will redirect to the login page

export default withAuthorization(condition)(withFirebase(ExpandedSingleChat));
