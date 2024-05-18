import React from 'react'
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@material-ui/core';
import UserListItem, { UserListItemProps } from './UserListItem';
import ItemList from '../Shared/ItemList';
import Typography from '../Shared/Typography';

export interface UserListProps {
    users: any,
    loadMore: () => void,
    listItemProps?: Partial<UserListItemProps>,
    selectedIds?: number[],
    selectAll?: boolean
}

export default function UserList({users, listItemProps, selectedIds, selectAll, loadMore}: UserListProps) {
    const {__id, edges, pageInfo} = useFragment(
        graphql`
            fragment UserListFragment on UserConnection {
                __id
                edges {
                    node {
                        id
                        userId
                        ...UserListItemFragment
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        `,
        users
    )


    return (
        <ItemList
            hasMore={pageInfo.hasNextPage}
            dataLength={edges.length}
            loadMore={loadMore}
        >
            {
                edges.map((e: any) => (
                    <UserListItem
                        {...listItemProps}
                        user={e.node}
                        connectionIds={[__id]}
                        checked={selectedIds?.includes(e.node.userId) || selectAll}
                    />
                ))
            }
        </ItemList>
    )
}
