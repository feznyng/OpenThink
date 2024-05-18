import React from 'react'
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import type { SpacePeopleSearchResultsQuery } from './__generated__/SpacePeopleSearchResultsQuery.graphql';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@material-ui/core';
import { SpacePeopleSearchResultsFragment_results$key } from './__generated__/SpacePeopleSearchResultsFragment_results.graphql';
import UserListItem from '../User/UserListItem';
import UserList from '../User/UserList';
import { SpacePeopleSearchResultsPaginationQuery } from './__generated__/SpacePeopleSearchResultsPaginationQuery.graphql';

interface SpacePeopleSearchResultsProps {
    space: any,
    query: string,
    userIds?: number[],
    onUserSelect?: (userId: number) => void,
    selectAll?: boolean
}

export default function SpacePeopleSearchResults({space, selectAll, userIds, onUserSelect, query}: SpacePeopleSearchResultsProps) {
    const {spaceId} = useFragment(
        graphql`
            fragment SpacePeopleSearchResultsFragment on Space {
                spaceId
            }
        `,
        space
    )

    const data = useLazyLoadQuery<SpacePeopleSearchResultsQuery>(
        graphql`
            query SpacePeopleSearchResultsQuery($spaceId: Int! $query: String!, $searchCount: Int!, $searchCursor: String) {
                space(spaceId: $spaceId) {
                    ...SpacePeopleSearchResultsFragment_results
                }
                
            }
        `,
        {spaceId, query, searchCount: 20}
    )

    const results = usePaginationFragment<SpacePeopleSearchResultsPaginationQuery, SpacePeopleSearchResultsFragment_results$key>(
        graphql`
            fragment SpacePeopleSearchResultsFragment_results on Space 
            @refetchable(queryName: "SpacePeopleSearchResultsPaginationQuery") {
                searchUsers(first: $searchCount, after: $searchCursor, query: $query) @connection(key: "SpacePeopleSearchResultsFragment_searchUsers") {
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        data.space
    )

    const {searchUsers} = (results.data as any);

    return (
        <UserList
            users={searchUsers}
            loadMore={() => results.loadNext(20)}
        />
    )
}
