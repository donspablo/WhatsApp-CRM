import React, {useContext, useEffect, useState} from "react";
import {withFirebase} from "../../firebase/index";
import {AuthUserContext} from "../../session/index";
import history from "../History";
import "./styles/sidebar.css";
import {db} from "../../firebase";


const NOOP = () => {
};

const Sidebar = ({sidebarOpen, closeSideBar, firebase, companyDataProp = NOOP}) => {

    const [companyName, setCompanyName] = useState("")
    const [companyNumber, setCompanyNumber] = useState(null)


    let adminUser = useContext(AuthUserContext)

    //get the company name
    useEffect(() => {
        const getCompany = async () => {
            if (adminUser) {
                let adminRef = db.collection('admins');
                let snapshot = await adminRef.where('adminId', '==', adminUser.uid).get()
                let name;
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        name = doc.data().company.toUpperCase();
                        setCompanyName(name)
                    })
                    //then get company number
                    let numberSnapshot = await db.collection('companies').where('name', '==', (name).toLowerCase()).get()
                    if (!numberSnapshot.empty) {
                        numberSnapshot.forEach(doc => {
                            let number = doc.data().number
                            setCompanyNumber(number)
                        })
                    }
                }
            }
        }
        getCompany();
    }, [adminUser])

    //pass the company name and number out as props to the admin and then subscription component
    useEffect(() => {
        companyDataProp({companyNumber, companyName})
    }, [companyNumber, companyName, companyDataProp])


    const getAgentsPage = () => {
        history.push('/admin/agents')
    }

    const chatsPage = () => {
        history.push('/admin/chats')
    }

    const adminHome = () => {
        history.push('/admin/home')
    }

    const subscriptionPage = () => {
        history.push('/admin/subscription')
    }

    const addPhonePage = () => {
        history.push('/admin/addPhone')
    }

    //loguout with auth
    const logOut = () => {
        firebase.doSignOut()
        history.push('/')
    }
    let cleanedName = companyName.replace("__", " ");
    return (
        <div id="sidebar" className={sidebarOpen ? "sidebar_responsive" : ""}>
            <div className="sidebar__title">
                <div className="sidebar__img">
                    <img src="" alt=""/>
                    <div className="company__info">
                        <h1>{cleanedName}</h1>
                        <h1>{companyNumber}</h1>
                    </div>
                </div>
                <i className="fa fa-times" id="sidebarIcon" onClick={closeSideBar}></i>
            </div>
            <div className="sidebar__menu">
                <div onClick={adminHome} id={1} className="sidebar__link sidebar__test active_menu_link">
                    <i className="fa fa-home"></i>
                    <p>Setup</p>
                </div>
                <div onClick={addPhonePage} id={2} className="sidebar__link sidebar__test">
                    <i className="fa fa-phone-square"></i>
                    <p>Phone</p>
                </div>
                <div onClick={chatsPage} id={3} className="sidebar__link sidebar__test">
                    <i className="fa fa-comments"></i>
                    <p>Chats</p>
                </div>
                <div onClick={getAgentsPage} id={4} className="sidebar__link sidebar__test">
                    <i className="fa fa-users"></i>
                    <p>Agents</p>
                </div>
                <div onClick={subscriptionPage} id={5} className="sidebar__link sidebar__test">
                    <i className="fa fa-credit-card"></i>
                    <p>Subscription</p>
                </div>
                <div onClick={logOut} className="sidebar__logout">
                    <i className="fa fa-power-off"></i>
                    <p>Log out</p>
                </div>
            </div>
        </div>
    )
}
export default withFirebase(Sidebar);

