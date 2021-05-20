import React, {Component} from "react";
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "./styles/agents.css";
import {db} from "../../firebase";

class Chats extends Component {

    constructor(props) {
        super(props)
        this.state = {
            agentList: [],
            customerList: [],
            chatHistory: [],
            adminUser: this.props.authUser ? this.props.authUser.uid : this.props.authUser,
            company: "",
            currentAgent: "",
            showLoading: false,
            customerLoading: false,
            chatLoading: false
        }
    }

    setActiveAgent = e => {
        this.setState({customerLoading: true})
        const {agentList} = this.state
        let currentClicked = e.target.id
        let singleActive = agentList.map(obj => {
            if (obj.name === currentClicked) {
                return {...obj, activeAgent: !obj.activeAgent}
            } else {
                return obj
            }
        })
        this.setState({
            agentList: singleActive
        }, () => {
            let newList = this.state.agentList.map(obj => {
                if (obj.name !== currentClicked) {
                    return {...obj, activeAgent: false}
                } else {
                    return obj
                }
            })
            this.setState({
                agentList: newList
            }, async () => {
                let selectedAgent = this.state.agentList.filter(obj => obj.activeAgent === true)
                let companyRef = db.collection('companies').doc(this.state.company);
                if (selectedAgent.length === 1) {
                    let agentid;
                    let currentAgent = selectedAgent[0].email
                    let agentSnapshot = await companyRef.collection('users').where('email', '==', currentAgent).get()
                    if (!agentSnapshot.empty) {
                        agentSnapshot.forEach(doc => {
                            agentid = doc.id
                        })
                    }
                    this.setState({
                        currentAgent: agentid
                    })
                    //get the agent's customers
                    companyRef.collection('users').doc(agentid).collection('customers').onSnapshot(snapshot => (
                        this.setState({
                            customerList: snapshot.docs.map(obj => {
                                return obj.data()
                            })
                        }, () => {
                            this.setState({customerLoading: false})
                            let selectedCustomer = this.state.customerList.filter(obj => obj.active === true)
                            if (selectedCustomer.length === 0) {
                                this.setState({
                                    chatHistory: [],
                                    chatLoading: false
                                })
                            }
                        })
                    ))
                } else {
                    this.setState({
                        customerList: [],
                        chatHistory: [],
                        customerLoading: false,
                        chatLoading: false
                    })
                }
            })
        })
    }


    setActiveNum = e => {
        this.setState({chatLoading: true})
        const {customerList} = this.state
        let currentClicked = Number(e.target.id)
        let singleActive = customerList.map(obj => {
            if (obj.name === currentClicked) {
                return {...obj, active: !obj.active}
            }
            return obj
        })
        this.setState({
            customerList: singleActive
        }, () => {
            let newCusList = this.state.customerList.map(obj => {
                if (obj.name !== currentClicked) {
                    return {...obj, active: false}
                }
                return obj
            })
            this.setState({
                customerList: newCusList
            }, async () => {
                let selectedCustomer = this.state.customerList.filter(obj => obj.active === true)
                let agentRef = db.collection('companies').doc(this.state.company).collection('users').doc(this.state.currentAgent).collection('customers');
                if (selectedCustomer.length === 1) {
                    //get the messages
                    let customerid;
                    let customerSnapshot;
                    let currentCustomer = selectedCustomer[0].name
                    if (currentCustomer) {
                        customerSnapshot = await agentRef.where('name', '==', currentCustomer).get()
                    }


                    if (!customerSnapshot.empty) {
                        customerSnapshot.forEach(doc => {
                            customerid = doc.id
                        })
                    }


                    agentRef.doc(customerid).collection('messages').orderBy('timestamp', 'asc').onSnapshot(snapshot => (
                        this.setState({
                            chatHistory: snapshot.docs.map(doc => {
                                return doc.data()
                            })
                        }, () => {
                            this.setState({chatLoading: false})
                        })
                    ))
                } else {
                    this.setState({
                        chatHistory: [],
                        chatLoading: false
                    })
                }
            })
        })
    }

    getUsers = async () => {
        this.setState({showLoading: true})
        let companyRef = db.collection('companies');
        let adminRef = db.collection('admins');
        const {adminUser} = this.state
        let adminID = adminUser
        if (adminID) {
            let snapshot = await adminRef.where('adminId', '==', adminID).get()
            let companyName;
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    companyName = doc.data().company
                })
            }
            let companyId;
            if (companyName) {
                let companySnapshot = await companyRef.where('name', '==', companyName).get()
                if (!companySnapshot.empty) {
                    companySnapshot.forEach(doc => {
                        companyId = doc.id
                    })
                }
                this.setState({
                    company: companyId
                })
            }

            this.unsubscribe = companyRef.doc(companyId).collection('users').where('role', '==', 'Agent').onSnapshot(snapshot => (
                this.setState({
                    agentList: snapshot.docs.map(obj => {
                        return obj.data()
                    })
                }, () => {
                    this.setState({
                        showLoading: false
                    })
                })
            ))
        }
    }

    componentDidMount() {
        this.getUsers()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.authUser !== this.props.authUser) {
            if (this.props.authUser) {
                this.setState({
                    adminUser: this.props.authUser.uid
                }, () => {
                    this.getUsers()
                })
            }
        }
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        const {agentList, customerList, chatHistory, showLoading, customerLoading, chatLoading} = this.state

        return (
            <div className="agents__container">
                <div className="agents__top__row">
                    <div className="agents__top__heading">
                        All Chats
                    </div>
                </div>
                <div className="agents__bottom__area">
                    <div className="agentlist__area chat__area">
                        <div className="agents__area">
                            <div className="agents__area__heading">
                                <p>Agents</p>
                            </div>
                            <div className="agents__area__body">
                                <div>{showLoading &&
                                <div className="agents__loader"><Loader type="Circles" color="#4FCE5D" height={40}
                                                                        width={40}/></div>}</div>
                                {
                                    agentList.map((obj, idx) => (
                                        <p onClick={this.setActiveAgent} key={idx} id={obj.name}
                                           className={obj.activeAgent ? "active__agent" : ""}>{obj.name}</p>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="agent__customers">
                            <div className="agent__customers__heading">
                                <p>Customer</p>
                            </div>
                            <div className="agent__customers__body">
                                <div>{customerLoading &&
                                <div className="agents__loader"><Loader type="Circles" color="#4FCE5D" height={40}
                                                                        width={40}/></div>}</div>
                                {
                                    customerList.map((obj, idx) => (
                                        <p onClick={this.setActiveNum} key={idx} id={obj.name}
                                           className={obj.active ? "active__num" : ""}>{obj.name}</p>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="agent__chat">
                            <div className="agent__chat__heading">
                                <p>Chat History</p>
                            </div>
                            <div className="agent__chat__body">
                                <div>{chatLoading &&
                                <div className="chats__loader"><Loader type="Circles" color="#4FCE5D" height={60}
                                                                       width={60}/></div>}</div>
                                {
                                    chatHistory.map((obj, idx) => (
                                        <p key={idx}
                                           className={`chat__message ${typeof (obj.name) === "number" && "chat__receiver"}`}>
                                            {obj.message}
                                            <span
                                                className="chat__timestamp">{new Date(obj.timestamp?.toDate()).toLocaleTimeString()}</span>
                                        </p>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Chats;
