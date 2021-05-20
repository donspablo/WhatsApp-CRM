import React, {Component} from "react";
import history from "../../History";
import CreditCardModal from "./CreditCardModal";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

const monthlyPlanId = process.env.REACT_APP_FLUTTERWAVE_MONTHLY_PLAN_ID
const annualPlanId = process.env.REACT_APP_FLUTTERWAVE_ANNUAL_PLAN_ID

class PaymentPlans extends Component {

    constructor() {
        super()
        this.state = {
            totalBill: 0,
            selectedRadio: "monthly",
            currentAgentEntered: 0,
            showError: false,
            defaultInput: '',
            showSuccessModal: false,
            showErrorModal: false,
            amountPaid: 0,
            flutterwavePaymentplanId: monthlyPlanId,
            monthlyCost: 25,
            annualCost: 21
        }
    }

    getCycle = e => {
        this.setState({
            selectedRadio: e.target.value
        })
    }

    closeSuccessModal = () => {
        this.setState({
            showSuccessModal: false
        }, () => {
            history.push('/admin/agents')
        })
    }

    closeErrorModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    handleRadioClick = (e) => {
        this.setState({
            selectedRadio: e.target.value
        }, () => {
            if (this.state.currentAgentEntered) {
                let totalCost;
                let currentEntry = Math.abs(Number(this.state.currentAgentEntered))
                if (this.state.selectedRadio === 'monthly') {
                    totalCost = currentEntry * this.state.monthlyCost
                    if (!isNaN(totalCost)) {
                        this.setState({
                            totalBill: totalCost
                        })
                    }
                } else {
                    totalCost = currentEntry * this.state.annualCost * 12
                    if (!isNaN(totalCost)) {
                        this.setState({
                            totalBill: totalCost,
                            flutterwavePaymentplanId: annualPlanId
                        })
                    }
                }
            }
        })
    }

    getPaymentError = value => {
        if (value < (this.state.monthlyCost * 2)) {
            this.setState({
                showError: true
            })
        }
    }

    paymentStatus = value => {
        const {status, amount} = value
        if (status === "successful") {
            //clear the input form and show a success message modal
            this.setState({
                defaultInput: "",
                totalBill: 0,
                showSuccessModal: true,
                amountPaid: Number(amount)
            })
        } else {
            //clear the input form and show an error message modal
            this.setState({
                defaultInput: "",
                totalBill: 0,
                showErrorModal: true
            })
        }
    }


    getAgentInput = (e) => {
        const {selectedRadio} = this.state
        let enteredValue = Math.abs(Number(e.target.value))
        this.setState({
            defaultInput: enteredValue
        })
        let agentCount = enteredValue
        let totalCost;
        if (selectedRadio === 'monthly') {
            totalCost = agentCount * this.state.monthlyCost
            if (!isNaN(totalCost)) {
                this.setState({
                    totalBill: totalCost,
                    currentAgentEntered: agentCount,
                    showError: false
                })
            }
        } else {
            totalCost = agentCount * this.state.annualCost * 12
            if (!isNaN(totalCost)) {
                this.setState({
                    totalBill: totalCost,
                    currentAgentEntered: agentCount,
                    showError: false,
                    flutterwavePaymentplanId: annualPlanId
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
        const {
            totalBill,
            selectedRadio,
            showError,
            currentAgentEntered,
            defaultInput,
            showSuccessModal,
            showErrorModal,
            amountPaid,
            flutterwavePaymentplanId,
            monthlyCost,
            annualCost
        } = this.state
        const {companyData} = this.props;

        return (
            <div className="expanded__downright">
                <div className="payment__container">
                    <div className="payment__top">
                        <div className="payment__top_toptext"> {//this div has been hidden in subscription.css
                        }
                            <p>Your current plan: <strong>Free Trial</strong></p>
                        </div>
                        <div className="payment__top_bottomtext">
                            <p>Minimum number of agents to subscribe for: <span
                                className="min__agents"><strong>2</strong></span></p>
                            <p>Subsequently, you can increase in units of <strong>1</strong></p>
                        </div>
                    </div>
                    <div className="payment__mid">
                        <div className="payment__mid__card">
                            <div className="payment__mid__price">
                                <h1>${monthlyCost}</h1>
                            </div>
                            <div className="payment__mid__desc">
                                <p>per agent, per month</p>
                                <p>billed monthly</p>
                            </div>
                        </div>
                        <div className="payment__mid__card">
                            <div className="payment__mid__price">
                                <h1>${annualCost}</h1>
                            </div>
                            <div className="payment__mid__desc">
                                <p>per agent, per month</p>
                                <p>billed yearly</p>
                            </div>
                        </div>
                    </div>
                    <div className="payment__bottom">
                        <div className="agent__count">
                            <div className="label__text1">
                                <label htmlFor="agent_number">Agents</label>
                            </div>
                            <input onChange={this.getAgentInput} type="text" name="agent_number" value={defaultInput}
                                   placeholder="E.g. 2"/>
                        </div>
                        <div className="billing__cycle">
                            <div className="label__text2">
                                <p>Billing cycle</p>
                            </div>
                            <div className="billing__radios">
                                <label className="billing__radio" htmlFor="monthly">
                                    <input onClick={this.handleRadioClick} onChange={this.getCycle} type="radio"
                                           name="billCycle" value="monthly" checked={selectedRadio === 'monthly'}/>
                                    <span className="label-visible">
										<span className="second__span">
											Monthly
										</span>
									</span>
                                </label>
                                <label className="billing__radio" htmlFor="yearly">
                                    <input onClick={this.handleRadioClick} onChange={this.getCycle} type="radio"
                                           name="billCycle" value="yearly" checked={selectedRadio === 'yearly'}/>
                                    <span className="label-visible">
										<span className="second__span">
											Yearly
										</span>
									</span>
                                </label>
                            </div>
                        </div>
                        <div className="total__bill">
                            <div className="bill__estimate">
                                <p>Estimated Total</p>
                            </div>
                            <div className="bill__value">
                                <h3>{`$${totalBill}`}</h3>
                            </div>
                        </div>
                        <div className="submit__payment__plan">
                            {showError ?
                                <div className="bill__error"><p>Error:please enter a number not less than 2 in the
                                    Agents field</p></div> : null}
                            <CreditCardModal companyData={companyData} getPaymentStatus={this.paymentStatus}
                                             getError={this.getPaymentError} totalBill={totalBill}
                                             agents={currentAgentEntered} paymentPlan={flutterwavePaymentplanId}
                                             monthlyCost={monthlyCost}/>
                            <SuccessModal onClose={this.closeSuccessModal} show={showSuccessModal}
                                          amountPaid={amountPaid}/>
                            <ErrorModal closeErr={this.closeErrorModal} showErr={showErrorModal}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default PaymentPlans;
