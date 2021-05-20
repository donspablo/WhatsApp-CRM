import React, {useContext, useEffect, useState} from 'react';
import {AuthUserContext} from "../../session/index";
import {SessionDataContext} from "../../encrypt/index";
import {Link} from 'react-router-dom';
import {Avatar} from "@material-ui/core";
import "../styles/singleclient.css";
import {db} from '../../firebase';


const SingleClient = ({dbObj, id, currentCustomer, companyid}) => {

    const {name} = dbObj //gotten from props

    //state
    const [customerMessage, setCustomerMessage] = useState([])

    //get the context obj to encrypt and decrypt
    const secret = useContext(SessionDataContext)

    //decrypt the company id with the session context
    let codedCompanyId = sessionStorage.getItem('iIi')
    let deCodedCompanyId = secret.decryption(codedCompanyId)
    let coyid = deCodedCompanyId


    //get the currently signed in agent id from auth context
    let agent;
    const authUser = useContext(AuthUserContext) //get auth context
    authUser ? agent = authUser.uid : agent = authUser //if there is an authe'd user, get the id else return the default authUser which is null

    useEffect(() => {
        let agentSnapshot = db.collection('companies').doc(coyid).collection('users').doc(agent).collection('customers')
        if (id) { //if a customer sends a message, get the id of the customer and extract the message
            let unsubscribe = agentSnapshot
                .doc(id)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .onSnapshot(snapshot => {
                    setCustomerMessage(snapshot.docs.map(doc => doc.data()))
                })
            return () => unsubscribe()
        }
    }, [id, coyid, agent])

    const getCustomer = () => {
        currentCustomer({id, name})  //name is the customer's number
        //encrypt the data before storing it in sessionStorage
        let codedcustomerName = secret.encryption(String(name)) //the encryption module only accepts strings, no integers
        sessionStorage.setItem('iiI', codedcustomerName)

        let codedcustomerID = secret.encryption(id)
        sessionStorage.setItem('iio', codedcustomerID)
    }

    return (
        <Link to={`/customers/${'xyz'}`}>
            <div className="singleclient" onClick={getCustomer}>
                <Avatar src=""/>
                <div className="singleclient__info">
                    <h2>{name}</h2>
                    <p>{customerMessage[0]?.message}</p>
                </div>
            </div>
        </Link>
    )
}


export default SingleClient;
