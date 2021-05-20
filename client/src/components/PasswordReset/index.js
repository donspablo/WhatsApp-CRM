import React, {Component} from "react";
import Loader from 'react-loader-spinner';
import {withFirebase} from "../../firebase/index";
import {AuthUserContext} from "../../session/index";
import {db} from "../../firebase";
import history from "../History";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "./passwordreset.css";

const PasswordResetPage = () => (
    <div>
        <AuthUserContext.Consumer>
            {authUser => <PasswordReset authUser={authUser}/>}
        </AuthUserContext.Consumer>
    </div>
)

const initialState = {
    password1: '',
    password2: '',
    error: null,
    showLoading: false
}

class PasswordResetFormBase extends Component {

    constructor() {
        super()
        this.state = {...initialState}
    }

    onPasswordOneChange = e => {
        this.setState({
            password1: e.target.value
        })
    }

    onPasswordTwoChange = e => {
        this.setState({
            password2: e.target.value
        })
    }

    submitResetPassword = () => {
        this.setState({showLoading: true})
        const {password1, password2} = this.state
        const {authUser} = this.props
        let allAgentsRef = db.collection('allagents');
        if (password2 !== password1) {
            this.setState({
                error: {
                    message: "The passwords do not match!"
                }
            })
        } else {
            this.props.firebase.doPasswordUpdate(password2)
                .then(async () => {
                    this.setState({...initialState})
                    let currentUser;
                    authUser ? currentUser = authUser.uid : currentUser = authUser
                    let companyid;
                    if (currentUser) {
                        let snapshot = await allAgentsRef.where('agentId', '==', currentUser).get()
                        if (!snapshot.empty) {
                            snapshot.forEach(doc => {
                                companyid = doc.data().companyId
                            })
                        }
                    }
                    if (companyid) {
                        let agentSnapshot = await db.collection('companies').doc(companyid).collection('users').doc(currentUser)
                        if (agentSnapshot) {
                            ////change status to active and loggedin to yes
                            await agentSnapshot.update({loggedin: 'Yes', status: "Active"})
                            history.push('/login')
                            this.setState({showLoading: false})
                        }
                    }
                })
                .catch(error => {
                    this.setState({showLoading: false, error})
                })
        }
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        const {password1, password2, error, showLoading} = this.state
        const isInvalid = password1 === "" || password2 === ""

        return (
            <div className="register__container">
                <p id="brand__name">Sauceflow</p>
                <div className="register__body password__reset">
                    <div className="form__heading">
                        <p>Password Update</p>
                        {showLoading &&
                        <div className="passwordreset__loading"><Loader type="Circles" color="#4FCE5D" height={30}
                                                                        width={30}/></div>}
                    </div>
                    <div className="form__container">
                        <div className="password__container">
                            <label className="field__label" htmlFor="owner__password">New Password</label>
                            <div className="password__container__input">
                                <input onChange={this.onPasswordOneChange} value={password1} type="password"
                                       name="password1" className="password1" required/>
                            </div>
                        </div>
                        <div className="password__container">
                            <label className="field__label" htmlFor="owner__password">Confirm New Password</label>
                            <div className="password__container__input">
                                <input onChange={this.onPasswordTwoChange} value={password2} type="password"
                                       name="password2" className="password2" required/>
                            </div>
                        </div>
                        <div className="submit__container">
                            {error && <p className="signup__error">{error.message}</p>}
                            <button disabled={isInvalid} onClick={this.submitResetPassword} type="submit"
                                    className="button">Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const PasswordReset = withFirebase(PasswordResetFormBase);

export default PasswordResetPage;

export {PasswordReset};
