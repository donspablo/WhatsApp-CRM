import React from "react";

const FirebaseContext = React.createContext(null);

export const withFirebase = Component => props => (
    <FirebaseContext.Consumer>
        {firebase => <Component {...props} firebase={firebase}/>}
    </FirebaseContext.Consumer>
)

export default FirebaseContext;


// import React, { useState } from "react";
// import { authMethods } from '../authmethods';
// export const firebaseAuth = React.createContext();

// const AuthProvider = ({ children }) => {

// 	const [newUserInput, setNewUserInput] = useState({ email:"", password:"" })
// 	const [errors, setErrors] = useState([])
// 	const [token, setToken] = useState(null)

// 	const handleSignup = () => {
// 		return authMethods.signup(newUserInput.email, newUserInput.password, setErrors, setToken)
// 	}

// 	return(
// 			<firebaseAuth.Provider
// 				value={{ handleSignup, newUserInput, setNewUserInput, errors }}
// 			>
// 				{ children }
// 			</firebaseAuth.Provider>
// 		)
// }

// export default AuthProvider
