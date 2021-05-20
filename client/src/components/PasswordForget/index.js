import React, {Component} from "react";
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {withFirebase} from "../../firebase/index";
import history from "../History";
import "./passwordforget.css";

const PasswordForgetPage = () => (
    <div>
        <PasswordForgetForm/>
    </div>
)

const initialState = {
    email: '',
    error: null,
    success: null,
    showLoading: false
}

class PasswordForgetFormBase extends Component {

    constructor() {
        super()
        this.state = {...initialState}
    }

    onEmailChange = e => {
        this.setState({
            email: e.target.value,
            error: null
        })
    }


    submitResetPassword = () => {
        this.setState({showLoading: true})
        const {email} = this.state
        this.props.firebase.doPasswordReset(email)
            .then(() => {
                this.setState({
                    success: "Success!!...please check your email.",
                    email: "",
                    showLoading: false
                })
                //this should run after like 5 secs
                setTimeout(() => history.push('/login'), 2)
            })
            .catch(error => {
                this.setState({error})
            })
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        const {email, error, success, showLoading} = this.state
        const isInvalid = email === ""

        return (
            <div className="register__container">
                <p id="brand__name">Sauceflow</p>
                <div className={`register__body password__forget ${showLoading && "password__forget_load"}`}>
                    <div className="form__heading">
                        <p>Get New password</p>
                    </div>
                    <div className="form__container">
                        {showLoading &&
                        <div className="passwordreset__loading"><Loader type="Circles" color="#4FCE5D" height={40}
                                                                        width={40}/></div>}
                        <div className="email__container">
                            <label className="field__label" htmlFor="owner__email">Email Address</label>
                            <div className="email__container__input">
                                <input onChange={this.onEmailChange} value={email} type="email" name="email"
                                       className="email"/>
                            </div>
                        </div>
                        {error && <p className="signup__error">{error.message}</p>}
                        <div className="submit__container">
                            <button disabled={isInvalid} onClick={this.submitResetPassword} type="submit"
                                    className="button">New Password
                            </button>
                            {success && <p className="signup__success">{success}</p>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const PasswordForgetForm = withFirebase(PasswordForgetFormBase)

export default PasswordForgetPage;

export {PasswordForgetForm};
