import React, {Component} from 'react';
import {Route, Router, Switch} from "react-router-dom";
import history from "./History";
import HomePage from "./HomePage/Homepage";
import SignUpPage from "./Register/Register";
import PasswordResetPage from "./PasswordReset/index";
import PasswordForgetPage from "./PasswordForget/index";
import Admin from "./Admin/Admin";
import SignInPage from "./Login";
import AgentPage from "./User";


class Routes extends Component {

    componentDidMount() {
        history.listen((location, action) => {

            if (location.pathname.includes('/customers') || location.pathname.includes('/admin')) {
                localStorage.setItem('abc', 'ooo') //this 'ooo' does not have a particular meaning, it is only needed to keep track of the fact that the agent was logged in and has clicked on at least a customer in the customer list, to prevent an error if the user clicks the browser back button after signing out
            }

            let previousPathname = localStorage.getItem('abc')
            if (previousPathname && (location.pathname === '/')) { //at the homepage and going back from here will throw an error as user is signed out
                setTimeout(() => history.push('/login'), 0)
            }
        })
    }

    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Route exact path="/" component={HomePage}/>
                    <Route path="/login" component={SignInPage}/>
                    <Route path="/admin" component={Admin}/>
                    <Route path="/register" component={SignUpPage}/>
                    <Route path="/passwordReset" component={PasswordResetPage}/>
                    <Route path="/passwordForget" component={PasswordForgetPage}/>
                    <Route path="/customers" component={AgentPage}/>
                </Switch>
            </Router>
        )
    }
}

export default Routes;
