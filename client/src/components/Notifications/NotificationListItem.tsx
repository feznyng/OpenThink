import { useState, useMemo, ReactElement } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, useLazyLoadQuery, useMutation } from 'react-relay';
import { IconButton, ListItem, ListItemAvatar, ListItemText, MenuItem, Menu } from '@material-ui/core';
import PostIcon from '../Post/PostIcon';
import SpaceIcon from '../Space/SpaceIcon';
import UserIcon from '../User/UserIcon';
import { FiberManualRecord, MoreVert, Done, Delete, PersonAdd, Close } from '@material-ui/icons';
import { timeAgo } from '../../utils/dateutils';
import { useHistory } from 'react-router';
import { Anchor } from '../../components/Post/PostContentEditor'
import { NotificationListItemReadMutation } from './__generated__/NotificationListItemReadMutation.graphql';
import { NotificationListItemQuery } from './__generated__/NotificationListItemQuery.graphql'
import { NotificationListItemDeleteMutation } from './__generated__/NotificationListItemDeleteMutation.graphql';
import { NotificationListItemUpdateSpaceUserMutation } from './__generated__/NotificationListItemUpdateSpaceUserMutation.graphql';
import { NotificationListItemDeleteSpaceUserMutation } from './__generated__/NotificationListItemDeleteSpaceUserMutation.graphql';
import { NotificationListItemUpdateConnectionMutation } from './__generated__/NotificationListItemUpdateConnectionMutation.graphql';
import { NotificationListItemDeleteConnectionMutation } from './__generated__/NotificationListItemDeleteConnectionMutation.graphql';


const baseMenuOptions = [
    {
        name: 'Delete',
        icon: <Delete/>,
        base: true,
    },
]
interface NotificationListItemProps {
    notification: any,
    connectionId?: string
}

interface NotificationListItemState {
    anchorEl: Anchor,
    hover: boolean
}
export default function NotificationListItem({notification, connectionId}: NotificationListItemProps) {
    const {id, type, post, userNotificationId, postUser, space, connection, user, post2, createdAt, spaceUser, read} = useFragment(
        graphql`
            fragment NotificationListItemFragment on Notification {
                id
                userNotificationId
                read
                type
                createdAt
                post {
                    ...PostIconFragment
                    spaces(first: 1) {
                        edges {
                            node {
                                spaceId
                            }
                        }
                    }
                    title
                    postId
                }
                post2 {
                    title
                    postId
                }
                space {
                    ...SpaceIconFragment
                    name
                    spaceId
                }
                user {
                    ...UserIconFragment
                    userId
                    firstname
                }
                spaceUser {
                    accepted
                    requestType
                    type
                    spaceUserId
                }
                postUser {
                    type
                }
                connection {
                    connectionId
                    accepted
                }
            }
        `,
        notification
    )

    const {me} = useLazyLoadQuery<NotificationListItemQuery>(
        graphql`
            query NotificationListItemQuery {
                me {
                    id
                    notificationsNum(read: false)
                }
            }
        `,
        {}
    )

    const [state, setState] = useState<NotificationListItemState>({
        hover: false,
        anchorEl: null
    })

    const types = type.split(' ')
    const mainType = types[0]
    const subType = types.splice(1, types.length).join(' ')

    
    const {icon, primaryText, link, menuActions} = useMemo(() => {
        let icon: any
        let primaryText = <p/>
        let link = ''
        const menuActions: {name: string, icon?: ReactElement, base?: boolean}[] = [...baseMenuOptions]
        menuActions.unshift({
            name: read ? 'Mark as unread' : 'Mark as read',
            icon: <Done/>,
            base: true
        })

        switch(mainType) {
            case 'post':
                icon = <PostIcon post={post} size={50}/>
                const spacePost = post?.spaces?.edges[0]?.node
                link = spacePost ? `/space/${spacePost.spaceId}/post/${post.postId}` : `/post/${post.postId}`
                switch(subType) {
                    case 'invite':

                        let type = 'invited'
                        switch(postUser.type) {
                            case 'Assignee':
                                type = 'assigned you to'
                                break
                            case 'Invitee':
                                type = 'invited you to'
                                break
                            case 'Requestee':
                                type = 'requested an answer from you for'
                                break
                        }
                        primaryText = <p><strong>{user.firstname}</strong> has {type} <strong>{post.title}</strong></p>
                        break
                    case 'edit':
                        primaryText = <p><strong>{user.firstname}</strong> updated <strong>{post.title}</strong></p>
                        break
                    case 'comment':
                        primaryText = <p><strong>{user.firstname}</strong> commented on <strong>{post.title}</strong></p>
                        break
                    case 'new post':
                        primaryText = <p><strong>{user.firstname}</strong> subposted {post2.title} under <strong>{post.title}</strong></p>
                        break
                }
                break
            case 'space':
                icon = <SpaceIcon space={space} size={50}/>
                link = `/space/${space.spaceId}`
                switch(subType) {
                    case 'invite':
                        if (spaceUser && !spaceUser.accepted || spaceUser.type !== spaceUser.requestType)
                            menuActions.push(
                                {
                                    name: 'Accept',
                                    icon: <PersonAdd/>
                                },
                                {
                                    name: 'Decline',
                                    icon: <Close/>
                                },
                            )
                        primaryText = <p><strong>{user.firstname}</strong> has invited you to join <strong>{space.name}</strong> as a {spaceUser?.type}</p>
                        break
                    case 'request':
                        if (spaceUser && !spaceUser.accepted || spaceUser.type !== spaceUser.requestType)
                            menuActions.push(
                                {
                                    name: 'Accept',
                                    icon: <PersonAdd/>
                                },
                                {
                                    name: 'Decline',
                                    icon: <Close/>
                                },
                            )
                        primaryText = <p><strong>{user.firstname}</strong> has requested to join <strong>{space.name}</strong> as a {spaceUser?.type}</p>
                        break
                    case 'invite accept':
                        primaryText = <p><strong>{user.firstname}</strong> has accepted your invite to join <strong>{space.name}</strong></p>
                        break
                    case 'request accept':
                        primaryText = <p><strong>{user.firstname}</strong> has accepted your request to join <strong>{space.name}</strong></p>
                        break
                    case 'new subspace':
                        if (space.project) {
                            primaryText = <p><strong>{user.firstname}</strong> created a new project <strong>{space.title}</strong></p>
                        } else {
                            primaryText = <p><strong>{user.firstname}</strong> created a new subgroup <strong>{space.title}</strong></p>
                        }
                        break
                    case 'new post':
                        primaryText = <p><strong>{user.firstname}</strong> created <strong>{post.title}</strong> in <strong>{space.name}</strong></p>
                        break
                }
                break
            case 'connection':
                icon = <UserIcon user={user} size={50}/>
                link = `/profile/${user.userId}`
                switch(subType) {
                    case 'request':
                        if (connection && !connection.accepted)
                            menuActions.push(
                                {
                                    name: 'Accept',
                                    icon: <PersonAdd/>
                                },
                                {
                                    name: 'Decline',
                                    icon: <Close/>
                                },
                            )
                        primaryText = <p><strong>{user.firstname} {user.lastname}</strong> {connection?.accepted ? 'connected' : 'wants to connect'} with you</p>
                        break
                    case 'accept':
                        primaryText = <p><strong>{user.firstname} {user.lastname}</strong> accepted your connection request</p>
                }
                break
        }
        return {icon, primaryText, link, menuActions}
    }, [id, read, spaceUser?.accepted, spaceUser?.requestType, connection?.accepted])
    
    const history = useHistory()


    const [commitReadNotification] = useMutation<NotificationListItemReadMutation>(
        graphql`
            mutation NotificationListItemReadMutation($input: NotificationReadInput!) {
                readNotification(input: $input) {
                    id
                    read
                }
            }
        `
    )
    
    const [commitDeleteNotification] = useMutation<NotificationListItemDeleteMutation>(
        graphql`
            mutation NotificationListItemDeleteMutation($input: DeleteNotificationInput!, $connections: [ID!]!) {
                deleteNotification(input: $input) {
                    deletedNotificationId @deleteEdge(connections: $connections)
                }
            }
        `
    )

    const [commitUpdateSpaceUser] = useMutation<NotificationListItemUpdateSpaceUserMutation>(
        graphql`
            mutation NotificationListItemUpdateSpaceUserMutation($input: UpdateSpaceUserInput!) {
                updateSpaceUser(input: $input) {
                    id
                    accepted
                }
            }
        `
    )

    const [commitDeleteSpaceUser] = useMutation<NotificationListItemDeleteSpaceUserMutation>(
        graphql`
            mutation NotificationListItemDeleteSpaceUserMutation($input: LeaveSpaceUserInput!) {
                removeSpaceUser(input: $input) {
                    deletedSpaceUserId
                }
            }
        `
    )

    const [commitUpdateConnection] = useMutation<NotificationListItemUpdateConnectionMutation>(
        graphql`
            mutation NotificationListItemUpdateConnectionMutation($input: UpdateConnectionInput!) {
                updateConnection(input: $input) {
                    id
                    accepted
                }
            }
        `
    )

    const [commitDeleteConnection] = useMutation<NotificationListItemDeleteConnectionMutation>(
        graphql`
            mutation NotificationListItemDeleteConnectionMutation($input: DeleteConnectionInput!) {
                deleteConnection(input: $input) {
                    accepted
                    connectionId
                    id
                }
            }
        `
    )

    const readNotification = (notificationRead?: boolean) => {
        const readStatus = notificationRead ? notificationRead : !read
        if (readStatus !== read)
            commitReadNotification({
                variables: {
                    input: {
                        read: readStatus,
                        notificationId: userNotificationId
                    }
                },
                updater: (store) => {
                    const meRecord = store.get(me!!.id)
                    let notificationsNum = me?.notificationsNum ? me?.notificationsNum : 0
                    readStatus ? notificationsNum-- : notificationsNum++
                    meRecord?.setValue(notificationsNum, "notificationsNum", {read: false})
                }
            })
    }

    const deleteNotification = () => {
        commitDeleteNotification({
            variables: {
                input: {
                    notificationId: userNotificationId
                },
                connections: connectionId ? [connectionId] : []
            },
            updater: (store) => {
                if (!read) {
                    const meRecord = store.get(me!!.id)
                    meRecord?.setValue((me?.notificationsNum ? me?.notificationsNum : 0) - 1, "notificationsNum", {read: false})
                }
            }
        })
    }

    const onClick = () => {
        readNotification(true)
        if (link && link.length > 0) {
            history.push(link)
        }
    }


    const onMenu = (name: string, base: boolean) => {
        setState({
            ...state,
            anchorEl: null
        })
        if (base) {        
            switch(name) {
                case 'Mark as read':
                    readNotification(true)
                    break
                case 'Mark as unread':
                    readNotification(false)
                    break
                case 'Delete':
                    deleteNotification()
                    break
            }
        } else {
            switch(mainType) {
                case 'post':
                    break
                case 'space':
                    deleteNotification()
                    switch(name) {
                        case 'Accept':
                            commitUpdateSpaceUser({
                                variables: {
                                    input: {
                                        requestType: spaceUser.type,
                                        accepted: true,
                                        spaceUserId: parseInt(spaceUser.spaceUserId)
                                    }
                                }
                            })
                            break
                        case 'Decline': 
                            commitDeleteSpaceUser({
                                variables: {
                                    input: {
                                        spaceUserId: parseInt(spaceUser.spaceUserId)
                                    }
                                }
                            })
                            break
                    }
                    break
                case 'connection': 
                    deleteNotification()
                    switch(name) {
                        case 'Accept':
                            commitUpdateConnection({
                                variables: {
                                    input: {
                                        connectionId: connection.connectionId,
                                        accepted: true,
                                    }
                                }
                            })
                            break
                        case 'Decline': 
                            commitDeleteConnection({
                                variables: {
                                    input: {
                                        userId: connection.user.userId
                                    }
                                }
                            })
                            break
                    }
                    break
            }
        }
    }

    return (
        <div 
            style={{position: 'relative'}}
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
        >
            <ListItem
                button
                onClick={onClick}
            >
                <ListItemAvatar>
                    {icon}
                </ListItemAvatar>
                <div style={{opacity: read ? 0.6 : 1}}>
                    <ListItemText
                        primary={primaryText}
                        secondary={timeAgo.format(new Date(createdAt))}
                        secondaryTypographyProps={{color: 'primary', style: {marginTop: -15}}}
                        style={{marginRight: 40, paddingLeft: 15}}
                    />
                </div>
                
            </ListItem>
            <div style={{position: 'absolute', right: 10, top: 0, display: 'flex', height: '100%', alignItems: 'center', zIndex: 20}}>
                <IconButton 
                    style={{visibility: state.hover ? 'visible' : 'hidden', marginRight: 5}} 
                    size="small"
                    onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        setState({
                            ...state,
                            anchorEl: e.currentTarget,
                        })
                    }}
                >
                    <MoreVert/>
                </IconButton>
                <Menu anchorEl={state.anchorEl} open={!!state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                    {
                        menuActions.map(({icon, name, base}) => (
                            <MenuItem onClick={() => onMenu(name, !!base)}>
                                {
                                    icon && 
                                    <ListItemAvatar>
                                        {icon}
                                    </ListItemAvatar>
                                }
                               
                                <ListItemText
                                    primary={name}
                                />
                            </MenuItem>
                        ))
                    }
                </Menu>
                <FiberManualRecord color="primary" style={{visibility: read ? 'hidden' : 'visible'}} fontSize="small"/>
            </div>
        </div>
    )
}
