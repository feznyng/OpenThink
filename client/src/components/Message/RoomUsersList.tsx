import { Typography } from '@material-ui/core'
import graphql from 'babel-plugin-relay/macro'
import { Presence } from 'phoenix'
import React from 'react'
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import { deleteRoomChannel, getRoomChannel } from '../../actions/messageActions'
import { commitActiveUser, commitInactiveUser, commitSyncUsers } from '../../mutations/UpdateRoomUsersList'
import store from '../../Store'
import { user } from '../../types/user'
import UserListItem from './RoomUsersListItem'
import { RoomUsersListQuery } from './__generated__/RoomUsersListQuery.graphql'

interface RoomUsersListProps {
    room: any, 
    directMessage: boolean,
    spaceID: string,
    roomID: string
}

interface RoomUsersListState {
    activeUsers: user[],
}

export default function RoomUsersList({room, directMessage, spaceID, roomID}: RoomUsersListProps) {
    const activeParams = usePaginationFragment(    
        graphql`      
            fragment RoomUsersList_active_users on Room
            @refetchable(queryName: "ActiveRoomUsersListPaginationQuery") {
                activeUsers(first: $userCount, after: $userCursor)        
                @connection(key: "RoomUsersList_activeUsers") {          
                    edges {
                        node {
                            user {
                                userId
                                ...RoomUsersListItem
                            }
                        }
                    }      
                }
            }    
        `,
        directMessage ? null : room
    );

    const room_graphql_id = room.__id;

    const inactiveParams = usePaginationFragment(    
        graphql`      
            fragment RoomUsersList_inactive_users on Room      
            @refetchable(queryName: "InactiveRoomUsersListPaginationQuery") {
                inactiveUsers(first: $userCount, after: $userCursor)        
                @connection(key: "RoomUsersList_inactiveUsers") {          
                    edges {
                        node {
                            user {
                                userId
                                ...RoomUsersListItem
                            }
                        }
                    }      
                }
            }    
        `,
        directMessage ? null : room
    );

    const userParams = usePaginationFragment(    
        graphql`      
            fragment RoomUsersList_users on Room      
            @refetchable(queryName: "RoomUsersListPaginationQuery") {
                dm
                roomId
                users(first: $userCount, after: $userCursor)        
                @connection(key: "RoomUsersList_users") {          
                    edges {
                        node {
                            user {
                                userId
                                ...RoomUsersListItem
                            }
                        }
                    }      
                }
            }    
        `,
        directMessage ? room : null
    );

    const { me } = useLazyLoadQuery<RoomUsersListQuery>(
        graphql`
            query RoomUsersListQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )
    

    const activeUsersData = activeParams.data?.activeUsers.edges.map((e: any) => e.node.user);
    const inactiveUsersData = inactiveParams.data?.inactiveUsers.edges.map((e: any) => e.node.user);
    const usersData = userParams.data?.users.edges.map((e: any) => ({...e.node.user, active: e.node.user.active || e.node.user.userId.toString() === me?.userId.toString()}));

    const activeRefetch = activeParams.refetch;
    const inactiveRefetch = inactiveParams.refetch;
    
    const refreshLists = () => {
        activeRefetch({}, {fetchPolicy: 'network-only'});
        inactiveRefetch({}, {fetchPolicy: 'network-only'});
    }

    React.useEffect(() => {
        if (spaceID) {
            let channel = getRoomChannel(roomID)
            let presence = new Presence(channel)
            if (spaceID == '@me') {
                presence.onSync(() => {
                    commitSyncUsers(room_graphql_id, presence.list())
                })
            } else {
                presence.onJoin((id, current, newPres) => {
                    if (!current) {
                        commitActiveUser(room_graphql_id, newPres.user.user_id, refreshLists)
                    }
                })
                
                presence.onLeave((id, current, leftPres) => {
                    if (current.metas.length === 0) {
                        commitInactiveUser(room_graphql_id, leftPres.user.user_id, refreshLists)
                    }
                })
                presence.onJoin((id, current, newPres) => {
                    if (!current) {
                        commitActiveUser(room_graphql_id, newPres.user.user_id, refreshLists)
                    }
                })
                
                presence.onLeave((id, current, leftPres) => {
                    if (current.metas.length === 0) {
                        commitInactiveUser(room_graphql_id, leftPres.user.user_id, refreshLists)
                    }
                })
            }
        }
        return () => {
            deleteRoomChannel(roomID);
        }
    }, [spaceID, roomID]);

    return (
        <div style={{height: '100%', width: 250, padding: 15, overflowY: 'auto'}}>
            {
                directMessage ? 
                <div>
                    <Typography>Members</Typography>
                    {
                        usersData && usersData.map((u: user) => (
                            <UserListItem
                                user={u}
                            />
                        ))
                    }
                </div>
                :
                <div>
                    {
                        activeUsersData && activeUsersData.map((u: user) => (
                            <UserListItem
                                user={({...u, active: true})}
                            />
                        ))
                    }
                    {
                        inactiveUsersData && inactiveUsersData.map((u: user) => (
                            <UserListItem
                                user={u}
                            />
                        ))
                    }
                </div>
            }
            
        </div>
    )
}
