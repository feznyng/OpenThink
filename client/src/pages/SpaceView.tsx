import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import {usePreloadedQuery, useQueryLoader} from 'react-relay';
import GeneralSpaceView from '../components/SpaceView/GeneralSpaceView';
import { SpaceViewQuery } from './__generated__/SpaceViewQuery.graphql';
import WikiProjectView from '../components/Wiki/WikiProjectView'
import WikiProjectViewQuery from '../components/Wiki/__generated__/WikiProjectViewQuery.graphql'
import SuspenseLoader from '../components/Shared/SuspenseLoader';
import TaskProjectView from '../components/Task/TaskProjectView';
import TaskProjectViewQuery from '../components/Task/__generated__/TaskProjectViewQuery.graphql'
import GraphProjectViewQuery from '../components/GraphProject/__generated__/GraphProjectViewQuery.graphql'
import GraphProjectView from '../components/GraphProject/GraphProjectView';
import { useAppDispatch, useAppSelector } from '../Store';
import { setNav } from '../actions/uiActions';
import { setSidebar } from '../components/MainNav/NavSlice';
import SolidarityProjectView from '../components/SolidarityProject/SolidarityProjectView'
import SolidarityProjectViewQuery from '../components/SolidarityProject/__generated__/SolidarityProjectViewQuery.graphql'

interface SpaceViewProps {
    queryRef: any
}

export default function SpaceView({queryRef}: SpaceViewProps) {
    const {space, me} = usePreloadedQuery<SpaceViewQuery>(    
        graphql`
            query SpaceViewQuery($id: Int!) {   
                space(spaceId: $id) {
                    projectType
                    project
                    spaceId
                    ...GeneralSpaceViewFragment
                }
                me {
                    ...GeneralSpaceViewFragment_me
                }
            }
        `,
        queryRef
    );
    
    const [
        wikiQueryRef,
        loadWikiQuery
    ] = useQueryLoader(WikiProjectViewQuery)

    const [
        taskQueryRef,
        loadTaskQuery
    ] = useQueryLoader(TaskProjectViewQuery)

    const [
        graphQueryRef,
        loadGraphQuery
    ] = useQueryLoader(GraphProjectViewQuery)

    const [
        solidarityQueryRef,
        loadSolidarityQuery
    ] = useQueryLoader(SolidarityProjectViewQuery)
    
    const views = [
        {
            view: 'General',
            View: GeneralSpaceView,
            props: {
                me,
                data: space
            }
        },
        {
            type: 'Wiki',
            View: WikiProjectView,
            props: {
                queryRef: wikiQueryRef
            }
        },
        {
            type: 'Task',
            View: TaskProjectView,
            props: {
                queryRef: taskQueryRef
            }
        },
        {
            type: 'Graph',
            View: GraphProjectView,
            props: {
                queryRef: graphQueryRef
            }
        },
        {
            type: 'Solidarity',
            View: SolidarityProjectView,
            props: {
                queryRef: solidarityQueryRef
            }
        },
    ]

    const dispatch = useAppDispatch()

    React.useEffect(() => {
        if (space?.project) {
            if (space.projectType && space.projectType !== 'General') {
                dispatch(setNav(false))
                dispatch(setSidebar(false))
            }

            switch(space.projectType) {
                case 'Wiki': 
                    loadWikiQuery({wikiCount: 50, spaceId: space.spaceId})
                    break
                case 'Task': 
                    loadTaskQuery({id: space.spaceId, taskCount: 100}, {fetchPolicy: 'store-and-network'})
                    break
                case 'Graph': 
                    loadGraphQuery({id: space.spaceId, postCount: 100})
                    break
                case 'Solidarity': 
                    loadSolidarityQuery({id: space.spaceId, mapCount: 20})
                    break
            }
        } else {
            dispatch(setNav(true))
        }
    }, [space?.spaceId])
    
    let currView = views.find(({type}) => space?.projectType === type)
    if (!currView) {
        currView = views[0]
    }
    const {View, props} = currView

    return (
        <SuspenseLoader
            fallback={<div>Loading...</div>}
            queryRef={props.queryRef}
        >
            <View {...props as any}/>
        </SuspenseLoader>
    )
}
