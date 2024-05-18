import React, { useEffect, useMemo, useState } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { usePaginationFragment, useSubscription } from 'react-relay';
import { NotificationsListQuery } from './__generated__/NotificationsListQuery.graphql';
import { NotificationsListFragment$key } from './__generated__/NotificationsListFragment.graphql';
import NotificationListItem from './NotificationListItem';
import Typography from '../Shared/Typography';
import { newNotificationSubscribe } from '../../subscriptions/NotificationsSubscription';
import InfiniteScroll from 'react-infinite-scroll-component';

interface NotificationsListProps {
    me: any,
    mainFilter?: string,
    subFilter?: string,
    getId: (id: string) => void
}

let subscribed: any

export default function NotificationsList({me, mainFilter, getId, subFilter}: NotificationsListProps) {
    const {data, refetch, loadNext, hasNext} = usePaginationFragment<NotificationsListQuery, NotificationsListFragment$key>(
        graphql`
            fragment NotificationsListFragment on User 
            @refetchable(queryName: "NotificationsListQuery") {
                id
                userId
                notifications(first: $notificationCount, after: $notificationCursor, type: $type, read: $read) @connection(key: "NotificationsFragment_notifications") {
                    __id
                    edges {
                        node {
                            id
                            ...NotificationListItemFragment
                        }
                    }
                }
            }
        `,
        me
    )
    

    const connectionId = data.notifications?.__id
    React.useEffect(() => {
        subscribed?.dispose();
        if (connectionId) {
            subscribed = newNotificationSubscribe({userId: data.userId}, connectionId, data.id);
        }
        return () => {
            subscribed?.dispose();
        }
    }, [connectionId]);

    useEffect(() => {
        connectionId && getId(connectionId)
    }, [connectionId])

    useEffect(() => {
        refetch({type: mainFilter, read: subFilter === 'Unread' ? false : null}, {fetchPolicy: 'store-and-network'})
    }, [mainFilter, subFilter])

    return (
        <div>
            <InfiniteScroll
                next={() => loadNext(10)}
                hasMore={hasNext}
                loader={<div/>}
                dataLength={data.notifications?.edges ? data.notifications?.edges.length : 0}
            >
            {
                data?.notifications?.edges?.map((e) => (
                    <NotificationListItem
                        notification={e?.node}
                        connectionId={connectionId}
                    />
                ))
            }
            </InfiniteScroll>
            {
                (data?.notifications?.edges && data.notifications.edges.length === 0) && 
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Typography variant="h6" style={{paddingBottom: 30}}>
                        You're all caught up!
                    </Typography>
                </div>
            }
        </div>
    )
}
