import React, {Component} from "react";
import Loader from 'react-loader-spinner'
import {withFirebase} from "../firebase/index";
import {SessionDataContext} from "../encrypt/index";
import history from "./History";
import "./styles/login.css"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import whatsapp from './media/whatsapp.png';
import {authFirebase, db} from '../firebase.js';

const SignInPage = () => (
    <div>
        <SessionDataContext.Consumer>
            {secret => <SignIn secret={secret}/>}
        </SessionDataContext.Consumer>
    </div>
)

const initialState = {
    signinUsername: "",
    signinPassword: "",
    error: null,
    showLoading: false
}


class LoginFormBase extends Component {

    constructor(props) {
        super(props)
        this.state = {...initialState}
    }

    getSigninUsername = e => {
        this.setState({
            signinUsername: e.target.value
        })
    }

    getSigninPassword = e => {
        this.setState({
            signinPassword: e.target.value
        })
    }

    onSubmitSignin = e => {
        e.preventDefault()
        this.setState({showLoading: true}) //this is to let the user know that the page is being loaded
        const {firebase} = this.props
        const {signinUsername, signinPassword} = this.state
        let adminRef = db.collection('admins');
        let allAgentsRef = db.collection('allagents');
        authFirebase.auth().setPersistence(authFirebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                return firebase.doSignInWithEmailAndPassword(signinUsername, signinPassword)
                    .then(async (user) => {
                        let currentUser = user.user.uid
                        //check the admin collection if the currentUser is there
                        let snapshot = await adminRef.where('adminId', '==', currentUser).get()
                        if (snapshot.empty) {//agent
                            //get the password - if default, send to the change password page else, send to customer list
                            if (signinPassword === "password") {
                                this.setState({showLoading: false})
                                history.push('/passwordReset')
                            } else {
                                this.setState({showLoading: false})
                                history.push('/customers')
                                //set loggedin to Yes
                                let companyid;
                                if (currentUser) {
                                    let allAgentSnapshot = await allAgentsRef.where('agentId', '==', currentUser).get()
                                    if (!allAgentSnapshot.empty) {
                                        allAgentSnapshot.forEach(doc => {
                                            companyid = doc.data().companyId
                                        })
                                    }
                                }
                                if (companyid) {
                                    let agentSnapshot = await db.collection('companies').doc(companyid).collection('users').doc(currentUser)
                                    if (agentSnapshot) {
                                        await agentSnapshot.update({loggedin: 'Yes'})
                                    }
                                }

                                //encrypt the signinusername before setting to sessionStorage
                                let codedUsername = this.props.secret.encryption(signinUsername)
                                sessionStorage.setItem('iii', codedUsername)
                            }
                        } else {//admin
                            this.setState({showLoading: false})
                            history.push('/admin')
                        }
                        //clear the form
                        this.setState({...initialState})
                    })
                    .catch(error => {
                        this.setState({showLoading: false, error})
                    })
            })
            .catch(error => {
                console.log('error occurred with session persistence', error)
            })
    }

    getNewPassword = () => {
        history.push('/passwordForget')
    }

    goHome = () => {
        history.go('/')
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        const {signinUsername, signinPassword, error, showLoading} = this.state
        const isInvalid = signinUsername === "" || signinPassword === ""

        return (
            <div className="signin">
                <div className="signin__container">
                    <img src={whatsapp} alt=""/>
                    <div className="form-container">
                        <h1 onClick={this.goHome} className="brand__name">Sauceflow</h1>
                        <form>
                            {showLoading && <Loader type="Circles" color="#4FCE5D" height={40} width={40}/>}
                            <div className="control">
                                <label htmlFor="name">Email</label>
                                <input value={signinUsername} onChange={this.getSigninUsername} type="text" name="name"
                                       id="name" placeholder="Email address"/>
                            </div>
                            <div className="control">
                                <label htmlFor="psw">Password</label>
                                <input value={signinPassword} onChange={this.getSigninPassword} type="password"
                                       name="psw" id="psw" placeholder="Password"/>
                            </div>
                            <div className="control">
                                {error && <p className="error__message">{error.message}</p>}
                                <input disabled={isInvalid} type="submit" value="Login" onClick={this.onSubmitSignin}/>
                            </div>
                        </form>
                        <div className="forgot__password">
                            <div onClick={this.getNewPassword}>Forgot Password</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const SignIn = withFirebase(LoginFormBase)

export default SignInPage;

export {SignIn};
