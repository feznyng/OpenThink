import React from 'react'
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@material-ui/core';
import UserListItem, { UserListItemProps } from './UserListItem';
import UserList, { UserListProps } from './UserList';
import { ConnectionsSearchResultsQuery } from './__generated__/ConnectionsSearchResultsQuery.graphql';
import { ConnectionsSearchResultsPaginationQuery } from './__generated__/ConnectionsSearchResultsPaginationQuery.graphql';
import { ConnectionsSearchResultsFragment_users$key } from './__generated__/ConnectionsSearchResultsFragment_users.graphql';

interface ConnectionsSearchResultsProps {
    user: any,
    space: any,
    query: string,
}

export default function ConnectionsSearchResults({space, user, query, ...props}: Partial<UserListProps> & ConnectionsSearchResultsProps) {
    const {spaceId} = useFragment(
        graphql`
            fragment ConnectionsSearchResultsFragment_space on Space {
                spaceId
            }
        `,
        space ? space : null
    )

    const {userId} = useFragment(
        graphql`
            fragment ConnectionsSearchResultsFragment_user on User {
                userId
            }
        `,
        user ? user : null
    )

    const data = useLazyLoadQuery<ConnectionsSearchResultsQuery>(
        graphql`
            query ConnectionsSearchResultsQuery($userId: ID!, $spaceId: Int, $query: String!, $searchCount: Int!, $searchCursor: String, $excludeRequested: Boolean) {
                user(userId: $userId) {
                    ...ConnectionsSearchResultsFragment_users
                }
            }
        `,
        {userId, spaceId, query, excludeRequested: true, searchCount: 20}
    )

    const connectionResults = usePaginationFragment<ConnectionsSearchResultsPaginationQuery, ConnectionsSearchResultsFragment_users$key>(
        graphql`
            fragment ConnectionsSearchResultsFragment_users on User 
            @refetchable(queryName: "ConnectionsSearchResultsPaginationQuery") {
                searchConnections(excludeSpaceId: $spaceId, first: $searchCount, after: $searchCursor, query: $query, excludeRequested: $excludeRequested) @connection(key: "onnectionsSearchResultsFragment_searchConnections") {
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        data.user
    )

    const {searchConnections} = connectionResults.data!!

    return (
        <UserList
            {...props}
            users={searchConnections}
            loadMore={() => connectionResults.loadNext(20)}
            
        />
    )
}
