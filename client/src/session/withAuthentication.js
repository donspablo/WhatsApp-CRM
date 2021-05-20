import React from "react";
import {withFirebase} from "../firebase/index";
import {AuthUserContext} from "./index";

const withAuthentication = Component => {
    class withAuthentication extends React.Component {
        constructor(props) {
            super(props)
            this.state = {
                authUser: null
            }
        }

        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
                authUser
                    ? this.setState({authUser})
                    : this.setState({authUser: null})
            })
        }

        componentWillUnmount() {
            this.listener()
        }

        render() {
            const {authUser} = this.state
            return (
                <AuthUserContext.Provider value={authUser}>
                    <Component {...this.props} />
                </AuthUserContext.Provider>
            )
        }
    }

    return withFirebase(withAuthentication);
}

export default withAuthentication;
