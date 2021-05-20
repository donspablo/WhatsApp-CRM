import React, {Component} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {withAuthentication} from "../session/index";
import Cryptic, {SessionDataContext} from "../encrypt/index";
import Routes from "./Routes";
import '../index.css';


class App extends Component {

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        return (
            <SessionDataContext.Provider value={new Cryptic()}>
                <div className="app">
                    <Router>
                        <Routes/>
                    </Router>
                </div>
            </SessionDataContext.Provider>
        );
    }
}

export default withAuthentication(App);
