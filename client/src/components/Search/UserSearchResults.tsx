import React, { CSSProperties } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, usePaginationFragment } from 'react-relay';
import { Card, CardContent, CardHeader, CircularProgress } from '@material-ui/core';
import UserListItem from '../User/UserListItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import Button from '../Shared/Button'
import { SearchTypeFilter } from './SearchFilters';
import { SearchResultsProps } from '../../pages/Search';
import { UserSearchResultsQuery } from './__generated__/UserSearchResultsQuery.graphql';
import { UserSearchResultsFragment$key } from './__generated__/UserSearchResultsFragment.graphql';
import Typography from '../Shared/Typography';


export default function UserSearchResults({searchResults, style, shortened, onFilterChange}: SearchResultsProps) {
    const {data, hasNext, loadNext} = usePaginationFragment<UserSearchResultsQuery, UserSearchResultsFragment$key>(
        graphql`
            fragment UserSearchResultsFragment on Query @refetchable(queryName: "UserSearchResultsQuery") {
                searchUsers(query: $query, first: $userCount, after: $userCursor) @connection(key: "UserSearchResultsFragment_searchUsers") {
                    edges {
                        node {
                            ...UserListItemFragment
                        }
                    }
                }
            }
        `,
        searchResults
    )

    const users = data.searchUsers?.edges ? data.searchUsers.edges.map(e => (
        <UserListItem user={e!!.node}/>
    )) : []

    return (
        <Card style={style}>
            <CardHeader
                title='People'
            />
            <CardContent>
                {
                    shortened ? 
                    users
                    :
                    <InfiniteScroll
                        next={() => loadNext(10)}
                        hasMore={hasNext}
                        dataLength={users?.length}
                        loader={<CircularProgress/>}
                    >
                        {users}
                    </InfiniteScroll>
                }
                {
                    users.length === 0 && 
                    <Typography>
                        No users found
                    </Typography>
                }
            </CardContent>
            {
                hasNext && shortened && 
                <Button 
                    fullWidth
                    onClick={() => onFilterChange('people')}
                    style={{borderRadius: 0}}
                >
                    See all people
                </Button>
            }
        </Card>
    )
}
