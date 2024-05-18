import React, { CSSProperties, useState } from 'react'
import { usePreloadedQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { GraphProjectViewQuery } from './__generated__/GraphProjectViewQuery.graphql';
import ProjectView from '../Projects/ProjectView'
import GraphMenu from './GraphMenu';
import { useAppDispatch, useAppSelector } from '../../Store';
import { toggleSidebar } from './GraphSlice';
import { useHistory, useParams } from 'react-router';
import GraphSidebar from './GraphSidebar';

interface GraphProjectViewProps {
    queryRef: any,
    style?: CSSProperties
}

export default function GraphProjectView({queryRef}: GraphProjectViewProps) {
    const { space } = usePreloadedQuery<GraphProjectViewQuery>(
        graphql`
            query GraphProjectViewQuery($id: Int, $postCount: Int!, $postCursor: String) {
                space(spaceId: $id) {
                    name
                    spaceId
                    ...GraphSidebarFragment
                    ...ProjectViewFragment
                }
            }
        `,
        queryRef
    )
    const dispatch = useAppDispatch()
    const open = useAppSelector(state => state.graph.sidebarOpen)
    const {spaceID, postID} = useParams<any>()
    const history = useHistory()
    
    return (
        <ProjectView
            project={space}
            sidebarOpen={open && !postID}
            toggleSidebar={() => dispatch(toggleSidebar())}
            sidebar={
                <GraphSidebar 
                    space={space}
                />
            }
            header={
                <div style={{width: '100%'}}>
                    <GraphMenu style={{float: 'right'}}/>
                </div>
            }
            content={
                <div>
                    Main
                </div>
            }
            postView={
                <div>
                    Post View
                </div>
            }
            postViewOpen
            closeSettings={() => history.replace(`/space/${spaceID}`)}
        />
    )
}
