import React, {Component} from "react";
import {Redirect, Route, Switch} from 'react-router-dom';
import {AuthUserContext, withAuthorization} from "../../session/index";
import Chats from "./Chats";
import Navbar from './Navbar';
import Sidebar from './Sidebar';
//import Main from "./Main";
import Agents from "./Agents";
import Subscription from "./Subscription";
import AddPhone from "./AddPhone";
import Setup from "./Setup";
import "../styles/admin.css";

class Admin extends Component {

    constructor() {
        super()
        this.state = {
            sidebarOpen: false,
            companyNum: "",
            companyName: "",
            companyID: ""
        }
    }

    openSideBar = () => {
        this.setState({
            sidebarOpen: true
        })
    }

    closeSideBar = () => {
        this.setState({
            sidebarOpen: false
        })
    }

    getCompanyID = value => {
        this.setState({
            companyID: value
        })
    }

    getCompanyData = value => {
        const {companyNumber, companyName} = value
        this.setState({
            companyNum: companyNumber,
            companyName: companyName
        })
    }

    render() {
        const {sidebarOpen, companyNum, companyName, companyID} = this.state
        let fullCompanyData = {companyName, companyNum, companyID}

        return (
            <div className="admin__container">
                <div className="admin__parent">
                    <Switch>
                        <Route path="/admin/home">
                            <Navbar sidebarOpen={sidebarOpen} openSideBar={this.openSideBar}/>
                            <Setup/>
                            {
                                //<Main />
                            }
                            <Sidebar companyDataProp={this.getCompanyData} sidebarOpen={sidebarOpen}
                                     closeSideBar={this.closeSideBar}/>
                        </Route>
                        <Route path="/admin/addPhone">
                            <Navbar sidebarOpen={sidebarOpen} openSideBar={this.openSideBar}/>
                            <AddPhone companyNumber={companyNum}/>
                            <Sidebar companyDataProp={this.getCompanyData} sidebarOpen={sidebarOpen}
                                     closeSideBar={this.closeSideBar}/>
                        </Route>
                        <Route path="/admin/chats">
                            <Navbar sidebarOpen={sidebarOpen} openSideBar={this.openSideBar}/>
                            <AuthUserContext.Consumer>
                                {authUser => <Chats authUser={authUser}/>}
                            </AuthUserContext.Consumer>
                            <Sidebar companyDataProp={this.getCompanyData} sidebarOpen={sidebarOpen}
                                     closeSideBar={this.closeSideBar}/>
                        </Route>
                        <Route path="/admin/agents">
                            <Navbar sidebarOpen={sidebarOpen} openSideBar={this.openSideBar}/>
                            <AuthUserContext.Consumer>
                                {authUser => <Agents companyidForPayment={this.getCompanyID} authUser={authUser}/>}
                            </AuthUserContext.Consumer>
                            <Sidebar companyDataProp={this.getCompanyData} sidebarOpen={sidebarOpen}
                                     closeSideBar={this.closeSideBar}/>
                        </Route>
                        <Route path="/admin/subscription">
                            <Navbar sidebarOpen={sidebarOpen} openSideBar={this.openSideBar}/>
                            <Subscription companyData={fullCompanyData}/>
                            <Sidebar companyDataProp={this.getCompanyData} sidebarOpen={sidebarOpen}
                                     closeSideBar={this.closeSideBar}/>
                        </Route>
                        <Redirect from="/admin" to="/admin/home" exact/>
                    </Switch>
                </div>
            </div>
        )
    }

}

const condition = authUser => authUser != null
//condition is a function (which was predefined as an argument in
//private/withAuthorization.js) and it checks if the authUser is not null
//if it is null, it will redirect to the login page

export default withAuthorization(condition)(Admin);
