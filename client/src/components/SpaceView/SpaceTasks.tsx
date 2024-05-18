import { Card, CardHeader } from '@material-ui/core';
import { List } from '@material-ui/icons';
import { ViewKanbanOutlined } from '@mui/icons-material';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import { useHistory, useParams } from 'react-router';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import ViewSelectAction from '../Space/ViewSelectAction';
import Tasks from '../Task/Tasks';
import type { SpaceTasksQuery as SpaceTasksQueryType } from './__generated__/SpaceTasksQuery.graphql';

const tabs = [
    {
        icon: <ViewKanbanOutlined/>,
        title: 'Board',
        value: 'board'
    },
    {
        icon: <List/>,
        title: 'List',
        value: 'list',
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
    */
]

interface SpaceTasks {
    queryRef: any,
    spaceId: number,
    expanded?: boolean,
    windowHeight: number
}

export default function SpaceTasks({queryRef, expanded, windowHeight}: SpaceTasks) {
    const {space, me} = usePreloadedQuery<SpaceTasksQueryType>(    
        graphql`      
            query SpaceTasksQuery($id: Int!, $taskCount: Int!, $taskCursor: String) {        
                space(spaceId: $id) {
                    spaceId
                    ...TasksFragment
                }
                me {
                    userId
                }
            }
        `,    
        queryRef
    );
    const history = useHistory();
    
    const {postID, spaceID, subPage} = useParams<any>();

    const openRow = (id: number | string) => {
        history.push(`/space/${spaceID}/tasks/${postID}/${id}`)
    }

    React.useEffect(() => {
        if (!postID) {
            history.replace(`/space/${spaceID}/tasks/${tabs[0].value}`)
        }
    }, [postID, subPage]);

    const changeView = (view: string) => {
        history.replace(`/space/${spaceID}/tasks/${view}`)
    }

    return (
        <div style={{paddingBottom: 15}}>
            <MaxWidthWrapper width={900}>
                <Card>
                    <CardHeader
                        title="Tasks"
                        action={
                            <ViewSelectAction
                                view={postID}
                                views={tabs}
                                changeView={changeView}
                            />
                        }
                    />
                    <div style={{paddingBottom: 20, paddingLeft: 5, paddingRight: 5}}>
                        {
                            space && 
                            <Tasks
                                tab={postID}
                                postId={subPage}
                                dialogOnly
                                source={space}
                                openTask={openRow}
                                closeTask={() => openRow('')}
                                spaceId={space.spaceId}
                            />
                        }
                    </div>
                </Card>
            </MaxWidthWrapper>
        </div>
    )
}
