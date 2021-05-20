import React, {Component} from "react";
import {withStyles} from '@material-ui/core/styles';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {withFirebase} from "../../firebase/index";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {db} from "../../firebase";


const styles = theme => ({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440
    }
})


class AgentList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            team: [],
            adminUser: this.props.authUser ? this.props.authUser.uid : this.props.authUser, //if the auth user is not null, get the uid otherwise return the default null authuser
            showLoading: false
        }
    }


    getUsers = async () => {
        this.setState({showLoading: true})
        let companyRef = db.collection('companies');
        let adminRef = db.collection('admins');
        const {adminUser} = this.state
        let adminID = adminUser
        if (adminID) {
            let snapshot = await adminRef.where('adminId', '==', adminID).get()
            let companyName;
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    companyName = doc.data().company
                })
            }
            let companyId;
            if (companyName) {
                let companySnapshot = await companyRef.where('name', '==', companyName).get()
                if (!companySnapshot.empty) {
                    companySnapshot.forEach(doc => {
                        companyId = doc.id
                    })
                }
            }
            this.props.companyID(companyId) //send it out to be used when adding new agents to the company
            this.unsubscribe = companyRef.doc(companyId).collection('users').orderBy('role', 'desc').onSnapshot(snapshot => (
                this.setState({
                    team: snapshot.docs.map(obj => {
                        return obj.data()
                    })
                }, () => {
                    this.setState({
                        showLoading: false
                    })
                })
            ))
        }
    }

    componentDidMount() {
        this.getUsers()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.authUser !== this.props.authUser) {
            if (this.props.authUser) {
                this.setState({
                    adminUser: this.props.authUser.uid
                }, () => {
                    this.getUsers()
                })
            }
        }
    }

    //to prevent memory leaks
    componentWillUnmount() {
        this.setState = (state, cb) => {

        }
    }

    render() {
        const {classes} = this.props;
        const {team, showLoading} = this.state;

        return (
            <div>
                <div>
                    {showLoading &&
                    <div className="loader"><Loader type="Circles" color="#4FCE5D" height={50} width={50}/></div>}
                </div>
                <Paper className={classes.root}>
                    <TableContainer className={classes.container}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="center">Role</TableCell>
                                    <TableCell align="center">Email</TableCell>
                                    <TableCell align="center">Loggedin</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {team.map(row => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">{row.name}</TableCell>
                                        <TableCell align="center">{row.role}</TableCell>
                                        <TableCell align="center">{row.email}</TableCell>
                                        <TableCell align="center">{row.loggedin}</TableCell>
                                        <TableCell align="center">{row.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </div>
        )
    }
}

export default withFirebase(withStyles(styles)(AgentList));
