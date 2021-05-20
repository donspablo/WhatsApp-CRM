import React, {Component} from "react";
import history from "../../History";

class Billfoot extends Component {

    constructor() {
        super()
        this.state = {
            selectorClass: true
        }
    }

    changeClass = () => {
        this.setState({
            selectorClass: !this.state.selectorClass
        })
    }

    subcriptionPage = () => {
        history.push('/admin/subscription/home')
        this.changeClass()
    }

    accountsPage = () => {
        history.push('/admin/subscription/account-details')
        this.changeClass()
    }

    render() {
        const {selectorClass} = this.state
        return (
            <div className="billing__footer">
                <p onClick={this.subcriptionPage} className={selectorClass ? "active__tab" : ""}>Your Subscription</p>
                {
                    //<p onClick={this.accountsPage} className={selectorClass ? "" : "active__tab"}>Account details</p>
                }
            </div>
        )
    }
}

export default Billfoot;
