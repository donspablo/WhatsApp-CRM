import React, {useContext} from "react";
import {FirebaseContext} from "../firebase/index";
import {Button} from "@material-ui/core";
import HomeAnimation from "./HomePage/HomeAnimation";
import history from "./History";
import "./styles/welcome.css";
import animationData from "../anime/welcome.json";
import {db} from '../firebase'

const AgentWelcome = ({name, companyid, agentUid}) => {
    const firebase = useContext(FirebaseContext)

    let firstName = name.split(" ")[0]

    const signOut = async () => {
        //signout the agent
        if (companyid && agentUid) {
            let agentSnapshot = await db.collection('companies').doc(companyid).collection('users').doc(agentUid)
            if (agentSnapshot) {
                await agentSnapshot.update({loggedin: 'No'})
            }
        }

        firebase.doSignOut()
        sessionStorage.clear()
        history.push('/')
    }
    return (
        <div className="agent__welcome">
            <div className="welcome__container">
                <div className="welcome__anime">
                    <HomeAnimation animationData={animationData} style={{width: 400, height: 400}}/>
                </div>
                <div className="welcome__text">
                    <p>Hey {firstName}!</p>
                    <p>Click on a phone number to chat with the customer</p>
                </div>
                <div className="welcome__signout">
                    <Button onClick={signOut} variant="outlined">Sign Out</Button>
                </div>
            </div>
        </div>
    )
}

export default AgentWelcome;
