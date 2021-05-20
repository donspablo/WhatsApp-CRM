import React from "react";
import HomeAnimation from "./HomeAnimation";
import history from "../History";
import "./homepage.css";
import animationData from "../../anime/team.json";

const HomePage = () => {

    const getSigninPage = () => {
        history.push('/login')
    }

    const getRegisterPage = () => {
        history.push('/register')
    }

    return (
        <div className="homepage__container">
            <div className="home__container">
                <div className="home__leftarea">
                    <div className="home__leftarea__top">
                        <h1>Sauceflow</h1>
                        <button onClick={getSigninPage}>Sign In</button>
                    </div>
                    <div className="home__leftarea__bottom">
                        <div className="hero__text">
                            <h5>One Business | Multiple Agents </h5>
                            <h5>One WhatsApp Number</h5>
                        </div>
                        <div className="middle__hero__text">
                            <p>
                                Sauceflow allows all your customer support staff connect
                                with your customers without restriction to one phone or
                                one WhatsApp web session.
                            </p>
                            <br/>
                            <p>
                                With Sauceflow, your business needs only one WhatsApp number to receive customer
                                messages
                                and can have as many agents as needed responding.
                            </p>
                            <br/>
                            <p>
                                Sign up for a free 2 day trial.
                            </p>
                        </div>
                        <div className="hero__button">
                            <button onClick={getRegisterPage}>Sign Up</button>
                        </div>
                    </div>
                    <div className="home__leftarea__footer">
                        Contact us: <a href="mailto:sauce@sauceflow.com">Email</a> | <a
                        href="https://wa.me/2348152258413" className="whatsapp_float" target="_blank"
                        rel="noopener noreferrer"><i className="fa fa-whatsapp whatsapp-icon"></i></a>
                    </div>
                </div>
                <div className="home__rightarea">
                    <HomeAnimation animationData={animationData} style={{width: 600, height: 500}}/>
                </div>
            </div>
        </div>
    )
}

export default HomePage;
