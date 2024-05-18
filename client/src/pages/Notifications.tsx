import React, { Fragment, Suspense, useState } from 'react'
import MaxWidthWrapper from '../components/Shared/MaxWidthWrapper'
import graphql from 'babel-plugin-relay/macro';
import { usePreloadedQuery, usePaginationFragment, useMutation } from 'react-relay';
import { NotificationsQuery } from './__generated__/NotificationsQuery.graphql';
import { Card, CardHeader, Chip, CircularProgress, Divider, IconButton, Menu, MenuItem } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import NotificationsList from '../components/Notifications/NotificationsList';
import { Anchor } from '../components/Post/PostContentEditor';

type SubFilter = 'All' | 'Unread'
type MainFilter = 'Any' | 'Posts' | 'Groups' | 'Projects' | 'Connections'

const subFilters: SubFilter[] = ['All', 'Unread']
const mainFilters: MainFilter[] = ['Any', 'Posts', 'Groups', 'Projects', 'Connections']
const menuActions = ['Mark all as read', /* 'Notification Settings' */]

interface NotificationsProps {
    queryRef: any
}

interface NotificationsState {
    subFilter: SubFilter,
    mainFilter: MainFilter,
    anchorEl: Anchor,
    id: string
}

export default function Notifications({queryRef}: NotificationsProps) {
    const {me} = usePreloadedQuery<NotificationsQuery>(
        graphql`
            query NotificationsQuery($notificationCount: Int!, $notificationCursor: String, $type: String, $read: Boolean) {
                me {
                    id
                    notificationsNum
                    ...NotificationsListFragment
                }
            }
        `,
        queryRef
    )


    const [state, setState] = useState<NotificationsState>({
        subFilter: 'All',
        mainFilter: 'Any',
        anchorEl: null,
        id: ''
    })

    const changeMainFilter = (mainFilter: MainFilter) => {
        setState({
            ...state,
            mainFilter
        })
    }

    const changeSubFilter = (subFilter: SubFilter) => {
        setState({
            ...state,
            subFilter
        })
    }

    const [commitReadAll] = useMutation(
        graphql`
            mutation NotificationsReadAllMutation($input: NotificationReadAllInput!) {
                readAllNotifications(input: $input)
            }
        `
    )

    const onMenu = (action: string) => {
        onCloseMenu()
        switch(action) {
            case 'Mark all as read':
                commitReadAll({
                    variables: {
                        input: {}
                    },
                    updater: (store) => {
                        const connection = store.get(state.id);
                        if (connection) {
                            const edges = connection.getLinkedRecords('edges')
                            edges?.forEach(e => {
                                const node = e.getLinkedRecord('node')
                                if (node) {
                                    node.setValue(true, 'read')
                                }
                            })
                        }
                        const meRecord = store.get(me!!.id!!)
                        meRecord?.setValue(0, "notificationsNum", {read: false})
                    }
                })
                break
        }
    }

    const onCloseMenu = () => setState({...state, anchorEl: null})

    return (
        <MaxWidthWrapper width={600}>
            <Card>
                <CardHeader
                    title={'Notifications'}
                    subheader={
                        <div style={{display: 'flex', alignItems: 'center', paddingTop: 15}}>
                            {
                                mainFilters.map(mainFilter => (
                                    <Chip
                                        label={mainFilter}
                                        color={mainFilter === state.mainFilter ? 'primary' : 'default'}
                                        style={{marginBottom: 5, marginRight: 5}}
                                        onClick={() => changeMainFilter(mainFilter)}
                                    />
                                ))
                            }
                            <Divider flexItem orientation='vertical' style={{marginLeft: 5, marginRight: 10}}/>
                            {
                                subFilters.map(subFilter => (
                                    <Chip
                                        label={subFilter}
                                        style={{marginBottom: 5, marginRight: 5}}
                                        onClick={() => changeSubFilter(subFilter)}
                                        color={subFilter === state.subFilter ? 'primary' : 'default'}
                                    />
                                ))
                            }
                        </div>
                    }
                    action={
                        <Fragment>
                            <IconButton onClick={(e) => setState({...state, anchorEl: e.currentTarget})}>
                                <MoreVert/>
                            </IconButton>
                            <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={onCloseMenu}>
                                {
                                    menuActions.map(action => (
                                        <MenuItem onClick={() => onMenu(action)}>
                                            {action}
                                        </MenuItem>
                                    ))
                                }
                            </Menu>
                        </Fragment>
                    }
                />
                <Suspense fallback={<div style={{width: '100%', display: 'flex', justifyContent: 'center'}}><CircularProgress/></div>}>
                    <NotificationsList
                        me={me}
                        mainFilter={state.mainFilter}
                        subFilter={state.subFilter}
                        getId={(id) => setState({...state, id})}
                    />
                </Suspense>
            </Card>
        </MaxWidthWrapper>
    )
}
