import { Add, CallMade, Inbox, Done, PersonAdd } from '@material-ui/icons'
import React, { Fragment, useState } from 'react'
import { useFragment, useMutation, ConnectionHandler, commitLocalUpdate, useLazyLoadQuery } from 'react-relay'
import Button from '../Shared/Button'
import graphql from 'babel-plugin-relay/macro';
import { ButtonProps, Menu, MenuItem } from '@material-ui/core';
import { environment } from '../../Store'
import { JoinButtonQuery } from './__generated__/JoinButtonQuery.graphql';
import { useHistory } from 'react-router';
/**
 * TODO: 
 * - Create join mutation
 * - Create leave mutation
 * - Create request to change type mutation
*/

interface JoinButtonProps {
    space: any,
}

export default function JoinButton({space, ...props}: ButtonProps & JoinButtonProps) {
    const {spaceId, id, currUser} = useFragment(
        graphql`      
            fragment JoinButtonFragment on Space {
                spaceId
                id
                currUser {
                    id
                    spaceUserId
                    __id
                    type
                    accepted
                    request         
                    requestType     
                }
            }
        `,    
        space
    )
    const {me} = useLazyLoadQuery<JoinButtonQuery>(
        graphql`
            query JoinButtonQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )
    
    const [state, setState] = useState<{anchorEl: null | Element}>({
        anchorEl: null
    })

    let text = 'Join'
    let startIcon = <Add/>

    if (currUser && currUser.spaceUserId) {
        if (currUser.accepted) {
            if (currUser.requestType && currUser.type !== currUser.requestType) {
                text = 'Requested'
                startIcon = <CallMade/>
            } else {
                switch(currUser.type) {
                    case 'Creator':
                        text = 'Moderator';
                        break;
                    case 'Moderator':
                        text = 'Moderator';
                        break;
                    case 'Member':
                        text = 'Member';
                        break;
                    case 'Follower':
                        text = 'Following';
                        break;
                    default:
                        text = 'Member'
                        break
                }
                startIcon = <Done/>
            }
           
        } else if (currUser.request) {
            text = 'Requested'
            startIcon = <CallMade/>
        } else if (currUser.spaceUserId) {
            text = 'Invited'
            startIcon = <Inbox/>
        }
    }
    
    const [joinSpace] = useMutation(
        graphql`
            mutation JoinButtonJoinMutation($input: JoinSpaceInput!) {
                joinSpace(input: $input) {
                    userEdge {
                        node {
                            ...UserListItemFragment
                            spaceUser {
                                id
                                spaceUserId
                                type
                                accepted
                                request
                                requestType
                            }
                        }
                    }
                }
            }
        `
    )

    const [leaveSpace] = useMutation(
        graphql`
            mutation JoinButtonLeaveMutation($input: LeaveSpaceUserInput!) {
                removeSpaceUser(input: $input) {
                    currUser {
                        id
                        spaceUserId
                        type
                        accepted
                        request
                        requestType
                    }
                }
            }
        `
    )

    const [updateUser] = useMutation(
        graphql`
            mutation JoinButtonUpdateMutation($input: UpdateSpaceUserInput!) {
                updateSpaceUser(input: $input) {
                    id
                    spaceUserId
                    type
                    accepted
                    request
                    requestType
                }
            }
        `
    )

    const exitSpace = () => {
        leaveSpace({
            variables: {
                input: {
                    spaceUserId: parseInt(currUser.spaceUserId)
                }
            },
            onCompleted: () => {
                commitLocalUpdate(
                    environment,
                    store => {
                        const spaceRecord = store.get(id)
                        const root = store.getRoot()
                        const meId = root.getLinkedRecord("me")?.getDataID()
                        if (!meId) return
                        let name = ''
                        if (currUser.type === 'Follower') 
                            name = 'SpaceMembers_followers'
                        else if (currUser.accepted) {
                            switch(currUser.type) {
                                case 'Member':
                                    name = 'SpaceMembers_members'
                                    break
                                case 'Moderator':
                                    name = 'SpaceMembers_moderators'
                                    break
                            }
                        } else {
                            name = 'SpaceMembers_invitees'
                        }
                        if (spaceRecord) {
                            const connectionRecord = ConnectionHandler.getConnection(
                                spaceRecord,
                                name,
                            )
                            if (connectionRecord)
                                ConnectionHandler.deleteNode(
                                    connectionRecord,
                                    meId,
                                )
                        }
                    }
                )
            }
        })
    }

    const onClick = (type: string) => {
        setState({
            ...state,
            anchorEl: null
        })

        if (type === 'Accept') {
            updateUser({
                variables: {
                    input: {
                        accepted: true,
                        spaceUserId: parseInt(currUser.spaceUserId)
                    }
                }
            })
        }

        if (!currUser.spaceUserId) {
            joinSpace({
                variables: {
                    input: {
                        spaceId,
                        type,
                    }
                },
                updater: (store) => {
                    const spaceRecord = store.get(id)
                    if (spaceRecord) {
                        const payload = store.getRootField('joinSpace');
                        if (payload) {
                            const userEdge = payload.getLinkedRecord("userEdge")

                            const accepted = userEdge?.getLinkedRecord("node")?.getLinkedRecord("spaceUser")?.getValue("accepted")
                            
                            let connectionRecord
                            let name
                            if (accepted) {
                                connectionRecord = ConnectionHandler.getConnection(
                                    spaceRecord,
                                    'SpaceMembers_members',
                                )
                                name = 'numMembers'
                            } else {
                                connectionRecord = ConnectionHandler.getConnection(
                                    spaceRecord,
                                    'SpaceMembers_invitees',
                                )
                                name = 'numInvitees'
                            }
                            if (connectionRecord) {
                                if (userEdge) {
                                    const newEdge = ConnectionHandler.buildConnectionEdge(
                                        store,
                                        connectionRecord,
                                        userEdge,
                                    )
                                    if (newEdge) {
                                        spaceRecord.setValue(spaceRecord.getValue(name) as number + 1, name)
                                        ConnectionHandler.insertEdgeAfter(
                                            connectionRecord,
                                            newEdge,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            })
        } else {
            if (type === 'Leave') {
                exitSpace()
            }
            if (type === 'Cancel Request') {
                if (currUser.accepted) {
                    updateUser({
                        variables: {
                            input: {
                                requestType: currUser.type,
                                spaceUserId: parseInt(currUser.spaceUserId),
                            }
                        }
                    })
                } else {
                    exitSpace()
                }
            }
            if (type === 'Become Moderator') {
                updateUser({
                    variables: {
                        input: {
                            type: "Member",
                            requestType: "Moderator",
                            spaceUserId: parseInt(currUser.spaceUserId)
                        }
                    }
                })
            }
            if (type === 'Become Member') {
                updateUser({
                    variables: {
                        input: {
                            type: "Follower",
                            requestType: "Member",
                            spaceUserId: parseInt(currUser.spaceUserId),
                        }
                    }
                })
            }
        }
    }

    const menuOptions = []
    if (!currUser.spaceUserId) {
        menuOptions.push(
            {
                name: 'Member'
            },
            {
                name: 'Moderator'
            },
        )
    } else {
        if (currUser.accepted) {
            if (currUser.type === 'Member' && currUser.requestType !== "Moderator") {
                menuOptions.push({
                    name: 'Become Moderator'
                })
            } else if (currUser.type === "Follower" && currUser.requestType !== "Member") {
                menuOptions.push({
                    name: 'Become Member'
                })
            }
            menuOptions.push({
                name: 'Leave'
            })
        }
        if (text === 'Invited') {
            menuOptions.push({
                name: 'Accept'
            })
        }
        if (!currUser.accepted || (currUser.requestType && currUser.requestType !== currUser.type)) {
            menuOptions.push({
                name: 'Cancel Request'
            })
        }
    }

    const history = useHistory()

    return (
        <Fragment>
            <Button
                variant='contained'
                color="primary"
                startIcon={startIcon}
                {...props}
                onClick={(e) => me?.userId ? setState({...state, anchorEl: e.currentTarget}) : history.push('/signup')}
            >
                {text}
            </Button>
            <Menu
                open={!!state.anchorEl}
                anchorEl={state.anchorEl}
                onClose={() => setState({...state, anchorEl: null})}
            >
                {
                    menuOptions.map(({name}) => (
                        <MenuItem
                            onClick={() => onClick(name)}
                        >
                            {name}
                        </MenuItem>
                    ))
                }
            </Menu>
        </Fragment>
    )
}
