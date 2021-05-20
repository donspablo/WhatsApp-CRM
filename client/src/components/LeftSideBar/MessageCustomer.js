import React from 'react';
import "../styles/singleclient.css";
import {db} from '../../firebase';

const MessageCustomer = () => {

    const createChat = () => {
        //this will bring up the option to enter the customer phone number and message
        //and the message will hit the endpoint for sending messages in twilio
        //and also save in the db for the agent
        //send via socket

        //open modal to specify customer
        const newCustomerNum = prompt('Enter the customer number:')
        if (newCustomerNum) {
            db.collection('agent1').add({
                customerNum: Number(newCustomerNum)
            })
        }
    }

    return (
        <div className="singleclient" onClick={createChat}>
            <div className="message__customer">
                <h2>New Customer Chat</h2>
            </div>
        </div>
    )
}

export default MessageCustomer;
