import React from 'react';
import Tasks from '../Task/Tasks';
import {useQueryLoader, usePreloadedQuery, fetchQuery} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import GeneralTabs from '../Shared/GeneralTabs';
import { useHistory, useParams } from 'react-router';
import { Paper } from '@material-ui/core';
import { secondaryColor } from '../../theme';
import { TaskProjectViewQuery } from './__generated__/TaskProjectViewQuery.graphql';
import SpaceMessages from '../SpaceView/SpaceMessages';
import SpaceColumnQuery from '../Message/__generated__/SpaceColumnQuery.graphql'
import TaskOverview from './TaskOverview';
import TaskOverviewQuery from './__generated__/TaskOverviewQuery.graphql';
import SuspenseLoader from '../Shared/SuspenseLoader';
import useWindowDimensions from '../../hooks/useWindowDimensions'
import ProjectHeader from '../Projects/ProjectHeader';
import SpaceSettings from '../SpaceView/SpaceSettings';
import { random } from 'lodash';
import SpaceWiki from '../SpaceView/SpaceWiki';
import SpaceWikiQuery from '../SpaceView/__generated__/SpaceWikiQuery.graphql'
import Typography from '../Shared/Typography';
import { environment } from '../../Store';
import { TaskProjectViewInitialPostQuery } from './__generated__/TaskProjectViewInitialPostQuery.graphql';

const headerHeight = 80

const tabs = [
    {
        title: 'Overview',
        value: 'overview'
    },
    {
        title: 'Board',
        value: 'board'
    },
    {
        title: 'List',
        value: 'list'
    },
    {
        title: 'Wiki',
        value: 'wiki'
    },
    {
        title: 'Messages',
        value: 'messages'
    },
    /*
    {
        title: 'Table',
        value: 'table'
    },
    {
        title: 'Calendar',
        value: 'calendar'
    },
    {
        title: 'Timeline',
        value: 'timeline'
    },
    {
        title: 'Dashboard',
        value: 'dashboard'
    },
    {
        title: 'Files',
        value: 'files'
    },
    */
]

interface SpaceTasks {
    queryRef: any,
}

export default function TaskProjectView({queryRef}: SpaceTasks) {
    const {space} = usePreloadedQuery<TaskProjectViewQuery>(    
        graphql`      
            query TaskProjectViewQuery($id: Int!, $taskCount: Int, $taskCursor: String) {        
                space(spaceId: $id) {
                    spaceId
                    name
                    projectType
                    ...SpaceIconFragment
                    ...TasksFragment
                    ...ProjectHeaderFragment
                }
            }    
        `,    
        queryRef
    );
    const {height} = useWindowDimensions()
    
    const [
        messagesQueryRef,
        loadMessagesQuery
    ] = useQueryLoader(SpaceColumnQuery)

    const [
        overviewQueryRef,
        loadOverview
    ] = useQueryLoader(TaskOverviewQuery)

    const [
        wikiQueryRef,
        loadWiki
    ] = useQueryLoader(SpaceWikiQuery)

    const history = useHistory();
    const {spacePage, postID, spaceID} = useParams<any>();
    const taskPage = (spacePage !== 'messages' && spacePage !== 'files' && spacePage !== 'overview' && spacePage !== 'wiki');

    React.useEffect(() => {
        if (spacePage === 'post') {
            fetchQuery<TaskProjectViewInitialPostQuery>(
                environment,
                graphql`
                    query TaskProjectViewInitialPostQuery($postId: ID!) {
                        post(postId: $postId) {
                            type
                        }
                    }
                `,
                {postId: postID},
            ).subscribe({
                next: ({post}) => {
                    if (post?.type === 'Wiki') {
                        history.replace(`/space/${spaceID}/wiki/${!!postID ? postID : ''}`)

                    } else {
                        history.replace(`/space/${spaceID}/board/${!!postID ? postID : ''}`)

                    }
                },
                error: (error: any) => console.log(error)
            })
        }
        switch(spacePage) {
            case 'messages': {
                loadMessagesQuery({id: parseInt(spaceID), roomCount: 500})
                break
            }
            case 'overview': {
                loadOverview({spaceId: parseInt(spaceID), userCount: 500, stratified: false})
                break
            }
            case 'wiki': {
                loadWiki({spaceId: parseInt(spaceID), wikiCount: 500})
                break
            }
            case 'list': {
                // loadWiki({spaceId: parseInt(spaceID), wikiCount: 500})
                break
            }
            default: 
                history.replace(`/space/${spaceID}/board`)
                break
        }
    }, [spacePage])


    const openItem = (postID: string | number) => {
        history.replace(`/space/${spaceID}/${spacePage}/${postID}`)
    }

    const { width } = useWindowDimensions()

    return (
        <div style={{height: '100%', width: '100%'}}>
            {
                spacePage === 'settings' && 
                <SpaceSettings
                    spaceId={space!!.spaceId}
                    fetchKey={random()}
                />
            }
            <div
                style={{height: '100%', paddingTop: 5, position: 'relative'}}
            >
                <div style={{height: headerHeight}}>
                    <Paper style={{position: 'fixed', zIndex: 100, top: 0, width: '100%', height: headerHeight, boxShadow: 'none', borderRadius: 0}}>
                        <div style={{height: '100%',position: 'relative'}}>
                            <ProjectHeader
                                style={{paddingTop: 5}}
                                space={space}
                            />
                            <div style={{position: 'absolute', left: 10, bottom: 0, maxWidth: width - 10, width: '100%', overflowX: 'auto'}}>
                                <GeneralTabs
                                    tabs={tabs}
                                    selected={spacePage}
                                    tabProps={{
                                        variant: 'small',
                                        style: {justifyContent: "flex-start", minWidth: 0}
                                    }}
                                    onClick={(value) => history.replace(`/space/${spaceID}/${value}`)}
                                />
                            </div>
                        </div>
                    </Paper>
                </div>
                <div style={{position: 'relative', height: '100%'}}>
                {
                    spacePage === 'overview' && 
                    <div>
                        <SuspenseLoader
                            queryRef={overviewQueryRef}
                            fallback={<div/>}
                        >
                            <TaskOverview
                                queryRef={overviewQueryRef}
                            />
                        </SuspenseLoader>
                    </div>
                }
                {
                    spacePage === 'messages' && 
                    <div style={{marginTop: -5}}>
                        <SpaceMessages
                            queryRef={messagesQueryRef}
                            openRoom={openItem}
                            windowHeight={height - (headerHeight + 3)}
                            roomId={postID}
                        />
                    </div>
                }
                {
                    spacePage === 'wiki' && 
                    <SuspenseLoader
                        queryRef={wikiQueryRef}
                        fallback={<div/>}
                    >
                        <SpaceWiki
                            queryRef={wikiQueryRef}
                            postId={postID as never}
                            openPost={openItem}
                            openPage={(page) => history.push(`/space/${spaceID}/wiki/${page}`)}
                            viewing='post'
                        />
                    </SuspenseLoader>
                }
                {
                    taskPage &&
                    <Tasks
                        source={space}
                        tab={spacePage}
                        style={{marginTop: 10}}
                        openTask={openItem}
                        closeTask={() => openItem('')}
                        spaceId={space?.spaceId}
                        postId={postID}
                    />
                }
                </div>
            </div>
        </div>
    )
}
