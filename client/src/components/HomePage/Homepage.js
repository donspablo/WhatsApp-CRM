import React from "react";
import HomeAnimation from "./HomeAnimation";
import history from "../History";
import "./homepage.css"; 
 
const HomePage = () => {
	
	const getSigninPage = () => {
		history.push('/login') 
	}

	const getRegisterPage = () => {
		history.push('/register')  
	}
 
	return( 
		<div className="homepage__container">
			<div className="home__container">
				<div className="home__leftarea">
					<div className="home__header">
					<p onClick={getSigninPage}>Sign In</p>
					<p onClick={getRegisterPage}>Sign Up</p>		
					</div>
					<div className="home__content">
						Content
					</div>
				</div>
				<div className="home__rightarea">
					<HomeAnimation />
				</div>
			</div>
		</div>
	)
}

export default HomePage;