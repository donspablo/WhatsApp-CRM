import React, {Component} from 'react';
import {Redirect, Route, Switch, withRouter} from 'react-router-dom';
import {SessionDataContext} from "../encrypt/index";
import {AuthUserContext, withAuthorization} from "../session/index";
import LeftBar from "./LeftSideBar/LeftBar";
import ExpandedSingleChat from "./ExpandedSingleChat";
import AgentWelcome from "./AgentWelcome";
import './styles/user.css';
import {db} from '../firebase'

//embed contexts
const AgentPage = () => (
    <div>
        <AuthUserContext.Consumer>
            {(authUser) => (
                <SessionDataContext.Consumer>{(secret) => <CustomerList secret={secret}
                                                                        authUser={authUser}/>}</SessionDataContext.Consumer>
            )}
        </AuthUserContext.Consumer>
    </div>
)

class UserBase extends Component {

    constructor(props) {
        super(props)
        this.state = {
            allChats: [],
            selectedCustomer: {},
            companyid: "",
            agentID: this.props.authUser ? this.props.authUser.uid : this.props.authUser,
            phoneId: "",
            agentName: "",
            productID: "",
            token: "",
        }
    }

    getMessages = async () => {
        const {agentID} = this.state
        let allAgentsRef = db.collection('allagents');
        let companyid;
        if (agentID) {
            let snapshot = await allAgentsRef.where('agentId', '==', agentID).get()
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    companyid = doc.data().companyId
                })
                //encrypt the company id before setting to sessionStorage
                let codedCompanyId = this.props.secret.encryption(companyid)
                sessionStorage.setItem('iIi', codedCompanyId)
                this.setState({
                    companyid: companyid
                })
            }
        }
        if (companyid) {
            db.collection('companies').doc(companyid).collection('users').doc(agentID).collection('customers').onSnapshot(snapshot => {
                this.setState({
                    allChats: snapshot.docs.map(obj => {
                        return {id: obj.id, data: obj.data()}
                    })
                })
            })

            //get phone id - check if free trial or paid user
            let phoneRef = await db.collection('companies').doc(companyid).get()
            if (phoneRef.exists) {
                const {productID, token, phoneID} = phoneRef.data()
                if (phoneID && productID && token) {//paid user
                    this.setState({
                        phoneId: phoneID,
                        productID: productID,
                        token: token
                    })
                } else {//free trial
                    let trialPhone = await db.collection('companies').doc(companyid).collection('trial').limit(1).get()
                    if (!trialPhone.empty) {
                        let trialData = trialPhone.docs.map(doc => doc.data())
                        const {phoneId, productId, token} = trialData[0]
                        this.setState({
                            phoneId: phoneId,
                            productID: productId,
                            token: token
                        })
                    }
                }
            }

            //agentName
            let nameRef = await db.collection('companies').doc(companyid).collection('users').doc(agentID).get()
            if (nameRef) {
                this.setState({
                    agentName: nameRef.data().name
                })
            }
        }
    }

    componentDidMount() {
        this.getMessages()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.authUser !== this.props.authUser) {
            if (this.props.authUser) {
                this.setState({
                    agentID: this.props.authUser.uid
                }, () => {
                    this.getMessages()
                })
            }
        }
    }

    getCustomer = data => {
        this.setState({
            selectedCustomer: data
        })
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        const {allChats, selectedCustomer, agentID, companyid, phoneId, agentName, productID, token} = this.state

        return (
            <div className="app__body">
                <Switch>
                    <Route path="/customers/all">
                        <LeftBar getCustomerData={this.getCustomer} companyid={companyid} customerList={allChats}/>
                        <AgentWelcome name={agentName} companyid={companyid} agentUid={agentID}/>
                    </Route>
                    <Route path="/customers/:customerId">
                        <LeftBar getCustomerData={this.getCustomer} customerList={allChats}/>
                        <SessionDataContext.Consumer>
                            {secret => <ExpandedSingleChat phoneId={phoneId} productID={productID} token={token}
                                                           secret={secret} agentUid={agentID}
                                                           selectedCustomer={selectedCustomer}/>}
                        </SessionDataContext.Consumer>
                    </Route>
                    <Redirect from="/customers" to="/customers/all" exact/>
                </Switch>
            </div>
        );
    }
}

const condition = authUser => authUser != null
//condition is a function (which was predefined as an argument in
//private/withAuthorization.js) and it checks if the authUser is not null
//if it is null, it will redirect to the login page

const CustomerList = withAuthorization(condition)(withRouter(UserBase));

export default AgentPage;

export {CustomerList};
