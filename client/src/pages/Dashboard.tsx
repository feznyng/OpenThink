import { Card, CardContent, CardHeader, CardMedia, Checkbox, CircularProgress, Dialog, Divider, Fab, Grid, Icon, IconButton, Link, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import React, { Fragment } from 'react'
import { RootState, useAppSelector } from '../Store';
import MyTasks from '../components/Dashboard/MyTasks'
import MyEvents from '../components/Dashboard/MyEvents'
import { Close } from '@material-ui/icons';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import Feed from '../components/Dashboard/Feed';
import SuggestedGroups from '../components/Dashboard/SuggestedGroups';
import MyGroups from '../components/Dashboard/MyGroups';
import { usePreloadedQuery, useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { DashboardQuery } from './__generated__/DashboardQuery.graphql';


interface announcement {
    title: string,
    body: string, 
}

interface AnnouncementCardProps {
    announcement: announcement,
    onClose: () => void
}

const AnnouncementCard = ({announcement, onClose}: AnnouncementCardProps) => {
    const {
        title,
        body
    } = announcement;
    
    return (
        <Card
            style={{
                background: 'linear-gradient(90deg, rgba(250,54,155,1) 0%, rgba(147,125,203,1) 35%, rgba(33,205,249,1) 63%, rgba(27,255,148,1) 91%)',           
                position: 'relative',
                borderRadius: 10,
                boxShadow: 'none'
            }}
        >
            <Card style={{margin: 3, marginTop: 4, marginBottom: 4, textAlign: 'left', boxShadow: 'none', borderRadius: 7, position: 'relative'}}>
                <CardHeader
                    title={title}
                />
                <CardContent style={{marginTop: -15}}>
                    <div dangerouslySetInnerHTML={{__html: body}}/>
                </CardContent>
                <IconButton style={{position: 'absolute', top: 5, right: 5}} onClick={onClose} size="small">
                    <Close fontSize="small"/>
                </IconButton>
            </Card>           
        </Card>
    )
}

interface announcement {
    title: string, 
    body: string, 
    announcement_id: number
}

interface DashboardProps {
    queryRef: any
}

export default function Dashboard({queryRef}: DashboardProps) {
    const {me, ...data} = usePreloadedQuery<DashboardQuery>(
        graphql`
            query DashboardQuery($feedCount: Int!, $spaceId: Int, $sortBy: String!, $feedCursor: String, $reactionCount: Int!, $reactionCursor: String, $tagCount: Int!, $tagCursor: String) {
                ...FeedFragment
                ...SuggestedGroupsFragment
                me {
                    ...MyGroupsFragment
                    ...MyTasksFragment
                    ...MyEventsFragment
                }
            }
        `,
        queryRef
    )
    const sidebarOpen = useAppSelector(state => state.nav.sidebarOpen)
    const theme = useTheme();
    const xs = useMediaQuery(theme.breakpoints.only('xs'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'))

    const rightSidebar = lg && !sidebarOpen

    const SidebarRight = (
        <React.Fragment>
            <MyGroups
                me={me}
            />
            <SuggestedGroups
                style={{marginTop: 20}}
                root={data}
            />
        </React.Fragment>
    )

    return (
        <div style={{paddingTop: 20}}>
            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                {
                    !xs && 
                    <div style={{paddingLeft: 25, paddingRight: 25, maxWidth: 400, width: '100%'}}>
                        {
                            me &&
                            <Fragment>
                                <MyEvents
                                    me={me}
                                />
                                <MyTasks
                                    style={{marginTop: 20}}
                                    me={me}
                                />
                            </Fragment>
                        }
                       
                        {
                            !rightSidebar && 
                            <div style={{marginTop: 20}}>
                                {SidebarRight}
                            </div>
                            
                        }
                        <div style={{height: 50}}/>
                    </div>
                }
                <div style={{maxWidth: 600, width: '100%'}}>
                    <Feed
                        feed={data}
                    />
                </div>
                {
                    rightSidebar && 
                    <div style={{paddingLeft: 25, paddingRight: 25, maxWidth: 400, width: '100%'}}>
                        {SidebarRight}
                    </div>
                }
            </div>
        </div>
    )
}