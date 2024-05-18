import { Dialog, IconButton, MenuItem, Paper, Tooltip, useTheme } from '@material-ui/core'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router';
import { usePreloadedQuery, useQueryLoader} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { SolidarityProjectViewQuery } from './__generated__/SolidarityProjectViewQuery.graphql';
import Graph, { Edge, Node } from '../DatabaseViews/GraphView';
import SolidarityPostView from './SolidarityPostView';
import SolidarityPostViewQuery from './__generated__/SolidarityPostViewQuery.graphql'
import SolidarityHeaderQuery from './__generated__/SolidarityHeaderQuery.graphql'
import SuspenseLoader from '../Shared/SuspenseLoader';
import GraphView from '../DatabaseViews/GraphView';
import { PostNode, postToNode } from '../GraphProject/PostGraph';
import PostDrawerLayout from '../Layouts/PostDrawerLayout';
import ProjectView from '../Projects/ProjectView';
import SolidaritySidebar from './SolidaritySidebar';
import SolidarityHeader from './SolidarityHeader';
import SolidarityMain from './SolidarityMain';
import SolidarityMainQuery from './__generated__/SolidarityMainQuery.graphql'
import { SpaceViewParams } from '../../types/router';
import { useAppSelector } from '../../Store';
import { queryString } from '../../utils/urlutils';
import { isNumber } from '../../utils/stringutils';

interface SolidarityProjectViewProps {
    queryRef: any
}

export default function SolidarityProjectView({queryRef}: SolidarityProjectViewProps) {
    const {space} = usePreloadedQuery<SolidarityProjectViewQuery>(    
        graphql`      
            query SolidarityProjectViewQuery($id: Int!, $mapCount: Int!, $mapCursor: String) {        
                space(spaceId: $id) {
                    spaceId
                    parentSpaceId
                    ...SpaceIconFragment
                    ...GraphActionsFragment
                    ...ProjectViewFragment
                    ...SolidaritySidebarFragment
                    name
                }
            }    
        `,    
        queryRef
    );

    const mobile = useAppSelector(state => state.uiActions.mobile)
    const [open, setOpen] = useState(false)
    
    const params = useParams<SpaceViewParams>()
    const {spaceID, spacePage} = params
    const [    
        headerQueryRef,
        loadHeaderQuery,
    ] = useQueryLoader(    
        SolidarityHeaderQuery,
    );

    const [    
        mainQueryRef,
        loadMainQuery,
    ] = useQueryLoader(    
        SolidarityMainQuery,    
    );

    const location = useLocation()
    const { view } = queryString.parse(location.search)

    const refreshGraph = () => loadMainQuery({postId: parseInt(spacePage), parentPostId: parseInt(spacePage), spaceId: parseInt(spaceID), viewId: parseInt(view as string)}, {fetchPolicy: 'network-only'})
    const history = useHistory()

    const [lastMap, setLastMap] = useState<null | string>(null)
    useEffect(() => {
        if (isNumber(spacePage)) {
            setLastMap(spacePage)
        }
    }, [spacePage])

    React.useEffect(() => {
        switch (spacePage) {
            case 'post':
                
                break
            case 'settings':
                break
            case undefined:
                break
            default: 
                refreshGraph()
                loadHeaderQuery({postId: spacePage}) 
        }
    }, [spacePage])

    return (
        <ProjectView
            sidebar={
                <SolidaritySidebar
                    project={space}
                />
            }
            header={
                <SuspenseLoader
                    queryRef={headerQueryRef}
                >
                    <SolidarityHeader
                        queryRef={headerQueryRef}
                    />
                </SuspenseLoader>
            }
            project={space}
            sidebarOpen={open}
            toggleSidebar={() => setOpen(!open)}
            content={
                <SuspenseLoader
                    queryRef={mainQueryRef}
                >
                    <SolidarityMain
                        queryRef={mainQueryRef}
                        refreshGraph={refreshGraph}
                    />
                </SuspenseLoader>
            }
            closeSettings={() => history.replace(`/space/${spaceID}/${lastMap ? lastMap : ''}`)}
        />
    )
}
