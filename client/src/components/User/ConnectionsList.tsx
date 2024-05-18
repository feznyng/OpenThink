import React from 'react'
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import UserList, { UserListProps } from './UserList';

interface ConnectionsListProps {
    user: any
}

export default function ConnectionsList({user, ...props}: ConnectionsListProps & Partial<UserListProps>) {
    const connections = usePaginationFragment(
        graphql`
            fragment ConnectionsListFragment on User 
            @refetchable(queryName: "ConnectionsListPaginationFragment") {
                connections(first: $connectionCount, after: $connectionCursor, excludeRequested: $excludeRequested, excludeSpaceId: $spaceId) @connection(key: "ConnectionsList_connections") {
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        user
    )
    
    return (
        <div>
            {
                connections.data?.connections && 
                <UserList
                    {...props}
                    users={connections.data.connections}
                    loadMore={() => connections.loadNext(20)}
                />
            }
        </div>
        
    )
}
