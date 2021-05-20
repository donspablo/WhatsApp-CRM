import React, {Component} from "react";
import AddAgentModal from "./AddAgent";
import {AuthUserContext} from "../../session/index";
import AgentList from "./AgentList";
import "./styles/agents.css";
import {db} from "../../firebase";

class Agents extends Component {

    constructor(props) {
        super(props)
        this.state = {
            show: false,
            companyid: "",
            activated: this.props.authUser ? this.props.authUser.emailVerified : this.props.authUser,
            userStatus: ""
        }
    }


    showModal = () => {
        this.setState({
            show: true
        })
    }

    closeOpenModal = () => {
        this.setState({
            show: !this.state.show
        })
    }

    sendCoyID = value => {
        this.setState({
            companyid: value
        }, () => {
            this.checkTrialStatus(this.state.companyid)
            this.props.companyidForPayment(this.state.companyid)
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.authUser !== this.props.authUser) {
            if (this.props.authUser) {
                this.setState({
                    activated: this.props.authUser.emailVerified
                })
            }
        }
    }

    checkTrialStatus = async (id) => {
        //get phone id - check if free trial or paid user
        let companyRef = await db.collection('companies').doc(id).get()
        if (companyRef.exists) {
            const {productID, token, phoneID} = companyRef.data()
            if (phoneID && productID && token) {//paid user
                this.setState({
                    userStatus: 'paidUser'
                })
            } else {//free trial
                let trialPhone = await db.collection('companies').doc(id).collection('trial').get()
                if (!trialPhone.empty) {
                    this.setState({
                        userStatus: 'freetrial'
                    })
                }
            }
        }
    }

    render() {
        const {companyid, activated, userStatus} = this.state
        const {authUser} = this.props;

        let adminEmail;
        if (authUser) {
            adminEmail = authUser.email
        }


        return (
            <div className="agents__container">
                <div className="agents__top__row">
                    {
                        activated //if the user has activated their email, display the div that holds 'TEAM', otherwise, display the div that has 'We sent an email to you'. Inside the team's div, check again if it is a free trial and show the max number of agents that can be added in the free trial version. When the free trial ends, this is no longer displayed
                            ? <div className="agents__top__heading">
                                Team
                                {userStatus === 'freetrial' ? <div>Free Trial Agent Limit: 2</div> : ""}
                            </div>
                            : <div><p>We sent an activation email to <b>{adminEmail}</b></p></div>
                    }
                    <div onClick={this.showModal} className="add__agent">
                        <button>
                            <div>Add Agent</div>
                        </button>
                    </div>
                    <AddAgentModal companyid={companyid} show={this.state.show} closeModal={this.closeOpenModal}/>
                </div>
                <div className="agents__bottom__area">
                    <div className="agentlist__area">
                        <AuthUserContext.Consumer>
                            {authUser => <AgentList companyID={this.sendCoyID} authUser={authUser}/>}
                        </AuthUserContext.Consumer>
                    </div>
                </div>
            </div>
        )
    }
}


export default Agents;
