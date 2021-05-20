import React, {Component} from "react";
import axios from 'axios';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "./styles/addphone.css";
import {db} from '../../firebase'

class AddPhone extends Component {

    constructor() {
        super()
        this.state = {
            productId: "",
            token: "",
            phoneId: "",
            phoneStatus: "",
            freeTrial: false,
            trialEnding: "",
            showLoading: false,
            statusClass: "",
            screenLoading: false
        }
    }

    getPhoneData = async (companyNumber) => {
        const companyRef = db.collection('companies')
        const snapshot = await companyRef.where('number', '==', companyNumber).get()
        let companyId;
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                companyId = doc.id
            })
        }
        if (companyId) {
            //check if there is a trial collection
            const trialDoc = await companyRef.doc(companyId).collection('trial').get()
            if (trialDoc.empty) {//paid user or ended trial
                this.setState({
                    phoneStatus: 'Trial Has Ended. Please make a subscription',
                    statusClass: 'status__red'
                })
                const paidSnapshot = await companyRef.doc(companyId).get()
                if (paidSnapshot.exists) {
                    const {token, phoneID, productID} = paidSnapshot.data()
                    if (token && phoneID && productID) {
                        this.setState({
                            token: token,
                            phoneId: phoneID,
                            productId: productID,
                            freeTrial: false,
                        }, () => {
                            this.getPhoneStatus()
                            this.getScreenStatus()
                            this.getSubscriptionStatus()
                        })
                    }
                }
            } else {
                trialDoc.forEach(doc => {
                    const {token, phoneId, productId, trialEnd} = doc.data()
                    if (token && phoneId && productId) {
                        this.setState({
                            token: token,
                            phoneId: phoneId,
                            productId: productId,
                            freeTrial: true,
                            trialEnding: trialEnd,
                        }, () => {
                            this.getPhoneStatus()
                            this.getScreenStatus()
                            this.getSubscriptionStatus()
                        })
                    }
                })
            }
        }
    }

    getPhoneStatus = async () => {
        this.setState({
            showLoading: true,
        })
        const INSTANCE_URL = 'https://api.maytapi.com/api';
        const {productId, token, phoneId} = this.state
        let url = `${INSTANCE_URL}/${productId}/${phoneId}/status`
        try {
            let response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': token
                }
            })

            if (response && response.status === 200) {
                const {data} = response;
                if (data) {
                    const {number, status} = data
                    if ((number === null) && (status.loggedIn === false)) {
                        this.setState({
                            phoneStatus: 'Please scan the QR Code to add your phone',
                            showLoading: false,
                            statusClass: 'status__red',
                        })
                    } else if ((number !== null) && (status.loggedIn === true) && status.state) {
                        this.setState({
                            phoneStatus: status.state.state,
                            showLoading: false,
                            statusClass: 'status__green',
                        })
                    }
                }
            }
        } catch (err) {
            console.log('phone status error >>', err)
        }
    }

    getScreenStatus = async () => {
        this.setState({
            screenLoading: true
        })
        const INSTANCE_URL = 'https://api.maytapi.com/api';
        const {productId, token, phoneId} = this.state
        let url = `${INSTANCE_URL}/${productId}/${phoneId}/screen`
        try {
            let response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': token
                }
            })

            if (response && response.status === 200) {
                this.setState({
                    screenLoading: false
                })
            }
        } catch (err) {
            if (err) {
                const {response} = err
                if (response) {
                    const {data} = response
                    if (data) {
                        const {message, success} = data;
                        if ((success === false) && (message === 'You do not have any phone limit.')) {
                            this.setState({
                                showLoading: false,
                                screenLoading: false,
                                phoneStatus: 'Trial Has Ended. Please make a subscription',
                                statusClass: 'status__red'
                            })
                        }
                    }
                }
            }
        }
    }

    //not called when subsciption has expired
    getSubscriptionStatus = async () => {
        const INSTANCE_URL = 'https://api.maytapi.com/api';
        const {productId, token, trialEnding} = this.state
        let url = `${INSTANCE_URL}/${productId}/product`
        try {
            let response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': token
                }
            })

            let hrsRemaining = this.trialRemainder(trialEnding)
            if (response && response.status === 200) {
                const {data} = response
                if (data) {
                    let subType = data['package']
                    if (subType === 'trial') {
                        let {phone_limit} = data
                        if (phone_limit) {
                            phone_limit = hrsRemaining
                            if (phone_limit < 1) {
                                //clear the trial data and set to empty strings
                                this.setState({
                                    phoneStatus: 'Trial Has Ended. Please make a subscription',
                                    showLoading: false,
                                    statusClass: 'status__red'
                                })
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.log('error getting subscription status', err)
        }
    }


    componentDidMount() {
        const {companyNumber} = this.props
        this.getPhoneData(companyNumber)
    }


    componentDidUpdate(prevProps) {
        if (prevProps.companyNumber !== this.props.companyNumber) {
            this.getPhoneData(this.props.companyNumber)
        }
    }


    trialRemainder = (endingDate) => {
        let remainder = endingDate - new Date(new Date()).getTime() //milliseconds
        let toHours = 1000 * 60 * 60
        let remainderHours = Math.floor(remainder / toHours)
        return remainderHours
    }

    render() {
        const {
            phoneStatus,
            productId,
            phoneId,
            token,
            freeTrial,
            trialEnding,
            showLoading,
            statusClass,
            screenLoading
        } = this.state
        const url = `https://api.maytapi.com/api/${productId}/${phoneId}/screen?token=${token}&time=${new Date(new Date()).getTime()}`
        let endtime = this.trialRemainder(trialEnding)

        let phrase;
        if (endtime > 1) {
            phrase = <p>Free Trial ends in <span className="status__red">{endtime}</span> hours</p>
        } else if (endtime === 1) {
            phrase = <p>Free Trial ends in <span className="status__red">{endtime}</span> hour</p>
        } else if (endtime < 1) {
            phrase = ""
        }

        return (
            <div className="addphone__container">
                <div className="addphone__status">
                    <div className="loading__spinner">Phone Status: {showLoading ?
                        <Loader type="Circles" color="#4FCE5D" height={25} width={25}/> :
                        <span className={statusClass}>{phoneStatus}</span>}</div>
                    {freeTrial && phrase}
                </div>
                <div className="addphone__parent">
                    <div className="loading__spinner__screen">{screenLoading &&
                    <Loader type="Circles" color="#4FCE5D" height={70} width={70}/>}</div>
                    <img alt="" src={url}/>
                </div>
            </div>
        )
    }
}

export default AddPhone;
