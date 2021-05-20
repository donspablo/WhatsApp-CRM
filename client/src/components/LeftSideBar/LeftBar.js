import React, {Component} from 'react';
import {Avatar, IconButton} from "@material-ui/core";
import {SearchOutlined} from "@material-ui/icons";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import AllClientArea from './AllClientArea';
import './leftbar.css';


class LeftBar extends Component {

    constructor() {
        super()
        this.state = {
            customerData: {}
        }
    }

    clicked = data => {
        this.setState({
            customerData: data
        }, () => {
            this.props.getCustomerData(this.state.customerData)
        })
    }

    render() {
        const {customerList, companyid} = this.props;
        return (
            <div className="leftbar">
                <div className="leftbar__header">
                    <Avatar/>
                    <div className="leftbar__headerRight">
                        <IconButton>
                            <DonutLargeIcon/>
                        </IconButton>
                        <IconButton>
                            <ChatIcon/>
                        </IconButton>
                        <IconButton>
                            <MoreVertIcon/>
                        </IconButton>
                    </div>
                </div>

                <div className="leftbar__search">
                    <div className="leftbar__searchContainer">
                        <SearchOutlined/>
                        <input type="text" placeholder="Search or start a new chat"/>
                    </div>
                </div>
                <div className="leftbar__chats">
                    <AllClientArea companyid={companyid} customerList={customerList} clickedCustomer={this.clicked}/>
                </div>
            </div>
        )
    }
}

export default LeftBar;
