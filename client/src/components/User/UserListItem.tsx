import React, { Fragment, useState } from 'react'
import { useFragment, useLazyLoadQuery, useMutation } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import UserIcon from '../User/UserIcon';
import Typography from '../Shared/Typography';
import ConnectButton from '../User/ConnectButton';
import { ListItem, ListItemAvatar, ListItemText, Chip, Checkbox, IconButton, MenuItem } from '@material-ui/core';
import UserPreviewCardWrapper from '../User/UserPreviewCardWrapper';
import { useHistory } from 'react-router';
import { UserListItemQuery } from './__generated__/UserListItemQuery.graphql';
import { Close, Done, Edit } from '@material-ui/icons';
import Button from '../Shared/Button';
import { UserListItemDeleteMutation } from './__generated__/UserListItemDeleteMutation.graphql';
import { UserListItemUpdateMutation } from './__generated__/UserListItemUpdateMutation.graphql';
import Select from '../Shared/Select';
import { UserIconProps } from './UserIcon'
import Link from '../Shared/Link';
/**
 * TODO:
 * - Allow user to change type (member, mod)
 * - Allow user to cancel request
 * - Allow user to accept/reject request
 */

export interface UserListItemProps {
    user: any,
    style?: React.CSSProperties,
    hideActions?: boolean,
    onSelect?: (userId: number) => void,
    checked?: boolean,
    editableTypes?: string[],
    connectionIds?: string[],
    spaceGraphId?: string,
    location?: 'Invitees' | 'Moderators' | 'Members' | 'Followers',
    userIconProps?: Partial<UserIconProps>,
    disablePreview?: boolean,
    disableLink?: boolean
}

export default function UserListItem({user, style, onSelect, disableLink, disablePreview, userIconProps, editableTypes, spaceGraphId, connectionIds, location, checked}: UserListItemProps) {
    const {firstname, lastname, userId, email, spaceUser, ...data} = useFragment(
        graphql`
            fragment UserListItemFragment on User {
                ...UserIconFragment
                ...UserPreviewCardWrapperFragment
                ...ConnectButtonFragment_connection
                firstname
                lastname
                email
                userId
                spaceUser {
                    id
                    spaceUserId
                    type
                    requestType
                    accepted
                    request
                }
            }
        `,
        user
    )

    const {me} = useLazyLoadQuery<UserListItemQuery>(
        graphql`      
            query UserListItemQuery {
                me {
                    userId
                }
            }
        `,
        {}, 
    );

    const [commitDeleteSpaceUser] = useMutation<UserListItemDeleteMutation>(
        graphql`
            mutation UserListItemDeleteMutation($input: LeaveSpaceUserInput!, $connections: [ID!]!) {
                removeSpaceUser(input: $input) {
                    deletedSpaceUserId @deleteEdge(connections: $connections)
                }
            }
        `
    )

    const [commitUpdateSpaceUser] = useMutation<UserListItemUpdateMutation>(
        graphql`
            mutation UserListItemUpdateMutation($input: UpdateSpaceUserInput!) {
                updateSpaceUser(input: $input) {
                    id
                    type
                    requestType
                    accepted
                }
            }
        `
    )
    const removeUser = () => {
        commitDeleteSpaceUser({
            variables: {
                input: {
                    spaceUserId: parseInt(spaceUser.spaceUserId)
                },
                connections: connectionIds ? connectionIds : []
            },
            updater: (store) => {
                if (spaceGraphId && location) {

                    let name = ''
                    switch(location) {
                        case 'Members': 
                            name = 'numMembers'
                            break
                        case 'Moderators':
                            name = 'numModerators'
                            break
                        case 'Invitees':
                            name = 'numInvitees'
                            break             
                    }
                    const space = store.get(spaceGraphId)
                    const currCount = space?.getValue(name)
                    space?.setValue((currCount as number) - 1, name)
                }
            }
        })
    }
    
    const [state, setState] = useState({
        editing: false,
        changedType: spaceUser?.type
    })
    
    const history = useHistory();

    const saveChanges = () => {
        commitUpdateSpaceUser({
            variables: {
                input: {
                    spaceUserId: parseInt(spaceUser.spaceUserId),
                    type: state.changedType,
                    requestType: state.changedType,
                    accepted: spaceUser.accepted
                }
            }
        })
        toggleEditing()
    }

    const acceptUser = () => {
        commitUpdateSpaceUser({
            variables: {
                input: {
                    spaceUserId: parseInt(spaceUser.spaceUserId),
                    accepted: true
                }
            }
        })
    }

    const toggleEditing = () => setState({...state, editing: !state.editing})
    const editable = spaceUser && editableTypes?.includes(spaceUser.type)

    return (
        <ListItem
            style={{...style, position: 'relative', paddingLeft: 0, paddingRight: 0}}
            onClick={(e) => onSelect && onSelect(userId)}
            button={!!onSelect as any}
        >  
            <div
                style={{display: 'flex'}}
            >
                {
                    !!onSelect && 
                    <Checkbox checked={!!checked}/>
                } 
                <ListItemAvatar>
                    <UserPreviewCardWrapper
                        user={data}
                        disabled={!!onSelect || disablePreview}
                    >
                        <span
                            onClick={() => !disableLink && !!!onSelect && history.push(`/profile/${userId}`)}
                        >
                            <UserIcon
                                size={40}
                                style={{marginRight: 10}}
                                {...userIconProps}
                                user={data}
                            />
                        </span>
                    </UserPreviewCardWrapper>
                </ListItemAvatar>
            </div>
           
           
            <UserPreviewCardWrapper
                user={data}
                disabled={!!onSelect || disablePreview}
            >
                 <ListItemText
                    disableTypography
                    primary={
                        <Link
                            to={(!disableLink && !!!onSelect) ? `/profile/${userId}` : null}
                        >
                            {firstname} {lastname}
                        </Link>
                    }
                    secondary={
                        spaceUser && spaceUser.type && 
                        <span>
                            {
                                spaceUser.accepted && 
                                <Chip
                                    size="small"
                                    label={spaceUser.type !== 'Creator' ? spaceUser.type : 'Moderator'}
                                />
                            }
                            {
                                editable && (!spaceUser.accepted || spaceUser.requestType !== spaceUser.type) &&
                                <Chip
                                    size="small"
                                    label={`${spaceUser.request ? 'Requested' : 'Invited'} as ${spaceUser.requestType ? spaceUser.requestType : spaceUser.type}`}
                                    style={{marginLeft: spaceUser.accepted ? 5 : 0}}
                                />
                            }
                        </span>
                    }
                />
            </UserPreviewCardWrapper>
            {
                state.editing &&
                <div style={{marginLeft: 20}}>
                    {
                        spaceUser.accepted && 
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{height: 40}}>
                                <Select style={{height: 40}} value={state.changedType} onChange={(e) => setState({...state, changedType: e.target.value})}>
                                    <MenuItem value="Moderator">
                                        Moderator
                                    </MenuItem>
                                    <MenuItem value={"Member"}>
                                        Member
                                    </MenuItem>
                                </Select>
                            </div>
                            
                            <Button style={{marginLeft: 10}} onClick={removeUser}>
                                Remove
                            </Button>
                        </div>
                    }
                    {
                        !spaceUser.accepted && 
                        <div>
                            {
                                spaceUser.request ? 
                                <div>
                                    <Button onClick={acceptUser}>
                                        Accept
                                    </Button>
                                    <Button onClick={removeUser}>
                                        Reject
                                    </Button>
                                </div>
                                :
                                <div>
                                    <Button onClick={removeUser}>
                                        Cancel Invite
                                    </Button>
                                </div>
                            }
                        </div>
                    }
                </div>
            }
            <div
                style={{position: 'absolute', right: 5, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}
            >
                {
                    editable && (spaceUser.type !== 'Creator' && spaceUser.type !== 'Follower') && 
                    <div style={{display: 'flex', alignItems: 'center', marginRight: 5}}>
                        {
                            state.editing && 
                            <IconButton size="small" onClick={toggleEditing}>
                                <Close/>
                            </IconButton>
                        }
                        <IconButton size="small" onClick={saveChanges}>
                            {state.editing ? <Done/> : <Edit/>}
                        </IconButton>
                    </div>
                }
                {
                    email && !state.editing && !onSelect && me && me.userId !== userId && 
                    <ConnectButton
                        userData={data}
                    />
                }
            </div>
        </ListItem>
    )
}
