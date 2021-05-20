import React, {useContext} from "react";
import {AuthUserContext} from "../../../session/index";
import {closePaymentModal, useFlutterwave} from 'flutterwave-react-v3';
import {db} from "../../../firebase";
import "../styles/cardModal.css";

const CreditCardModal = ({totalBill, agents, getError, getPaymentStatus, companyData, paymentPlan, monthlyCost}) => {
    const {companyName, companyNum, companyID} = companyData;
    let ftwKey = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY;
    let merchantId = process.env.REACT_APP_FLUTTERWAVE_MERCHANT_ID;
    let email;
    let authUser = useContext(AuthUserContext)
    if (authUser) {
        email = authUser.email
    }

    const config = {
        public_key: ftwKey,
        tx_ref: `${merchantId}_${Date.now()}`,
        amount: totalBill,
        currency: 'USD',
        payment_plan: paymentPlan,
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: email,
            phone_number: companyNum,
            name: companyName,
        },
        customizations: {
            title: 'WhatsApp CRM',
            description: `${agents} Agents`,
            logo: '',
        },
    };

    const handleFlutterPayment = useFlutterwave(config);

    const handlePayment = async () => {
        //if this is the first payment, has to be $50, otherwise, any amount
        let paymentSnapshot = await db.collection('companies').doc(companyID).collection('payments').get();
        if (paymentSnapshot.empty) {//first payment
            if (totalBill < (monthlyCost * 2)) {
                getError(totalBill)
            } else {
                handleFlutterPayment({
                    callback: response => {
                        const {status, amount} = response;
                        getPaymentStatus({status, amount}) //pass the response as a prop to the parent component
                        closePaymentModal()
                    },
                    onClose: () => {
                    }
                })
            }
        } else {
            handleFlutterPayment({
                callback: response => {
                    const {status, amount} = response;
                    getPaymentStatus({status, amount}) //pass the response as a prop to the parent component
                    closePaymentModal()
                },
                onClose: () => {
                }
            })
        }
    }

    return (
        <div className="credit__card">
            <button onClick={handlePayment}>Subscribe Now</button>
        </div>
    )
};

export default CreditCardModal;
