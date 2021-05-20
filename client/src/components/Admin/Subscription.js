import React from "react";
import {Redirect, Route, Switch} from 'react-router-dom';
import Billhead from "./Payment/Billhead";
import Billfoot from "./Payment/Billfoot";
import Billtopright from "./Payment/Billtopright";
import PaymentPlans from "./Payment/PaymentPlans";
import AccountDetails from "./Payment/AccountDetails";
import "./styles/subscription.css";


const Subscription = ({companyData}) => {
    return (
        <div className="subscr__container">
            <Switch>
                <Route path="/admin/subscription/home">
                    <Billhead/>
                    <Billfoot/>
                    <Billtopright/>
                    <PaymentPlans companyData={companyData}/>
                </Route>
                <Route path="/admin/subscription/account-details">
                    <Billhead/>
                    <Billfoot/>
                    <Billtopright/>
                    <AccountDetails/>
                </Route>
                <Redirect from="/admin/subscription" to="/admin/subscription/home" exact/>
            </Switch>
        </div>
    )
}

export default Subscription;

