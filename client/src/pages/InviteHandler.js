import React, { Component } from 'react'
import store from '../Store';
import {finishSpaceLink} from '../actions/orgActions'
import { CircularProgress } from '@material-ui/core';
export class InviteHandler extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        const url = this.props.match.params.url
        if (url) {
            if (store.getState().userActions.userInfo) { // signed in 
                finishSpaceLink(url).then(invite => {
                    
                    if (invite.message === 'Invite not found') { // backend says invite doesn't exist or it has expired
                        this.props.history.push('/not-found')
                    } else { // invite worked and user has been added - redirect to group they're joining
                        this.props.history.push({pathname: `/space/${invite.space_id}`, state: {from: this.props.location.pathname, clear: false, push: true}});
                    }
                });
            } else { // prompt user to sign in first 
                this.props.history.push({pathname: '/signin', state: {url}})
            }
        } else { //user went directly to this link for some reason
            this.props.history.push('/not-found');
        }
    }

    render() {
        return (
            <div>
                <CircularProgress/>
            </div>
        )
    }
}

export default InviteHandler
