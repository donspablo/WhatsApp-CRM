import React, {Component} from "react";
import Loader from 'react-loader-spinner';
import axios from 'axios';
import {CSSTransition} from "react-transition-group";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "./styles/modal.css";

class AddAgentModal extends Component {

    constructor() {
        super()
        this.state = {
            newAgentName: "",
            newAgentEmail: "",
            showError: false,
            errorMsg: "please enter a name and email",
            showLoading: false
        }
    }

    getAgentName = e => {
        this.setState({
            newAgentName: e.target.value,
            showError: false
        })
    }

    getAgentEmail = e => {
        this.setState({
            newAgentEmail: e.target.value,
            showError: false
        })
    }


    registerAgent = () => {
        this.setState({showLoading: true})
        const {newAgentEmail, newAgentName} = this.state
        const {companyid} = this.props;
        if (newAgentName === "" || newAgentEmail === "") {
            this.setState({
                showError: true
            })
        } else {
            let newUserData = {newAgentEmail, newAgentName, companyid}
            //send data to the backend to be handled by firebase admin
            axios.post(`/api/v0/users`, {newUserData})
                .then(res => {
                    //clear the form and close the modal
                    this.setState({
                        newAgentName: "",
                        newAgentEmail: "",
                        showLoading: false
                    })
                    this.props.closeModal()
                })
                .catch(err => {
                    if (err.response.data === 'Please make a new subscription to add more agents') {
                        this.setState({
                            errorMsg: err.response.data,
                            showError: true,
                            showLoading: false
                        })
                    } else {
                        this.setState({
                            errorMsg: 'An error occurred. Please try again',
                            showError: true,
                            showLoading: false
                        })
                    }
                })
        }
    }

    render() {
        const nodeRef = React.createRef(null)
        const {showError, errorMsg, showLoading} = this.state
        return (
            <CSSTransition
                in={this.props.show}
                unmountOnExit
                timeout={{enter: 0, exit: 300}}
                nodeRef={nodeRef}
            >
                <div ref={nodeRef} onClick={this.props.closeModal}
                     className={`agent__modal__container ${this.props.show ? "show" : ""}`}>
                    <div onClick={e => e.stopPropagation()} className="aa_modal__content">
                        <div className="aa_modal__header">
                            <h4 className="aa_modal__title">Invite Agents</h4>
                        </div>
                        <div className="aa_modal__body">
                            {showLoading &&
                            <div className="loader"><Loader type="Circles" color="#4FCE5D" height={50} width={50}/>
                            </div>}
                            <div className="aa_modal__name">
                                <label className="aa__agent__email" htmlFor="aa__agent__email">Name</label>
                                <div className="aa__email__container">
                                    <input onChange={this.getAgentName}
                                           placeholder="Enter new agent name e.g. Eve Adams" type="email"
                                           name="new_agent__email" className="new_agent__email" required/>
                                </div>
                            </div>
                            <div className="aa_modal__email">
                                <label className="aa__agent__email" htmlFor="aa__agent__email">Email</label>
                                <div className="aa__email__container">
                                    <input onChange={this.getAgentEmail} placeholder="Enter new agent email address"
                                           type="email" name="new_agent__email" className="new_agent__email" required/>
                                </div>
                            </div>
                            {showError ? <div className="bill__error"><p>{errorMsg}</p></div> : null}
                        </div>
                        <div className="aa__modal__footer add__agent">
                            <button className="aa__cancel" onClick={this.props.closeModal}>Cancel</button>
                            <button onClick={this.registerAgent}>Invite</button>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        )
    }
}


export default AddAgentModal;
