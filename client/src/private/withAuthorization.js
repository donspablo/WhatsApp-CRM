import React from "react";
import {Redirect, withRouter} from "react-router-dom";
import {withFirebase} from "../firebase/index";
import {compose} from 'recompose';

const withAuthorization = condition => Component => {
    class withAuthorization extends React.Component {

        constructor() {
            super()
            this.state = {
                redirect: false
            }
        }

        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    if (!condition(authUser)) {
                        this.setState({
                            redirect: true
                        })
                    }
                }
            )
        }

        componentWillUnmount() {
            this.listener()
        }

        render() {
            if (this.state.redirect) {
                return <Redirect to={{pathname: '/login'}}/>
            }
            return <Component {...this.props} />
        }
    }

    return compose(withRouter, withFirebase)(withAuthorization);
}

export default withAuthorization;
