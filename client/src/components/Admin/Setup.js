import React, {Component} from "react";
import "./styles/setup.css";

class Setup extends Component {
    render() {
        return (
            <div className="setup__container">
                <div className="setup__card">
                    <div className="setup__card__heading">
                        <div>1. Add a phone number</div>
                    </div>
                    <div className="setup__card__body">
                        <div>
                            You need to have WhatsApp enabled on the number where your customers
                            will reach you.
                            To get started, click on the Phone tab to the left and scan the QR
                            Code that shows on the screen.
                            <br/>
                            <br/>
                            If you get an error, please refresh the page and try again.
                        </div>
                    </div>
                </div>
                <div className="setup__card">
                    <div className="setup__card__heading">
                        <div>2. Add Agents</div>
                    </div>
                    <div className="setup__card__body">
                        <div>
                            Click on the Agents tab to the left to add agents to your account and view agent status.
                            <br/>
                            <br/>
                            When you add an agent, they will receive an email with instructions on
                            how to activate their agent account.
                            Once an agent has activated their account, they will be able to respond
                            to messages received on the phone number you have added.
                            <br/>
                            <br/>
                            After adding an agent, please inform them to check their email for setup instructions
                        </div>
                    </div>
                </div>
                <div className="setup__card">
                    <div className="setup__card__heading">
                        <div>3. Chat History</div>
                    </div>
                    <div className="setup__card__body">
                        <div>
                            As an admin, you can see the conversations that your agents are having with customers in
                            real-time. Click
                            on the Chats tab to the left to see this.
                        </div>
                    </div>
                </div>
                <div className="setup__card">
                    <div className="setup__card__heading">
                        <div>4. Subscription</div>
                    </div>
                    <div className="setup__card__body">
                        <div>
                            Need more agents, click on the Subscription tab to increase your agent limit
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Setup;
