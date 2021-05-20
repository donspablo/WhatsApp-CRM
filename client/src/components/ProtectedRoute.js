import React, {useContext, useEffect, useState} from "react";
//import { Redirect } from 'react-router-dom';
import {FirebaseContext} from "../firebase/index";


const ProtectedRoute = ({component}) => {
    const Component = component
    const firebase = useContext(FirebaseContext)
    const [authState, setAuthState] = useState({
        authenticated: false,
        initializing: true
    })

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setAuthState({
                    authenticated: true,
                    initializing: false
                })
            } else {
                setAuthState({
                    authenticated: false,
                    initializing: false
                })
            }
        })
    }, [setAuthState, firebase.auth])

    if (authState.initializing) {
        console.log('initializing...')
        return <div>Loading...</div>
    }

    // if (!authState.authenticated) {
    // 	console.log('you dont have access here!!')
    // 	return <Redirect to={{ pathname: '/login' }}/>
    // }
    return <Component authenticated={authState.authenticated}/>
}


export default ProtectedRoute;

// else {
// 		{
// 			//return <Redirect to={{ pathname: '/login' }}/>
// 		}
// 	}

// const ProtectedRoute = ({ component }) => {
// 	const Component = component
// 	const isAuthenticated = sessionStorage.getItem("aun");
// 	if (isAuthenticated) {
// 		return <Component />
// 	}
// 	return <Redirect to={{ pathname: '/login' }}/>
// }
