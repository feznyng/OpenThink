import React, { Suspense } from 'react'
import { usePreloadedQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import Typography from '../Shared/Typography';
import SpaceListItem from '../Space/SpaceListItem';
import ExpandButton from '../Shared/ExpandButton';
import CreateSpaceButton from '../Space/CreateSpaceButton';
import SearchButtonBar from '../Space/SearchButtonBar';
import CardTitleCount from '../Space/CardTitleCount';
import SpaceGroupsSearchResults from '../Space/SubspaceSearchResults';
import SearchLoader from '../Shared/SearchLoader';
import { SpaceGroupsQuery } from './__generated__/SpaceGroupsQuery.graphql';

interface SpaceGroupsProps {
    queryRef: any,
    project?: boolean
}

export default function SpaceGroups({queryRef, project}: SpaceGroupsProps) {
    const {space}: any = usePreloadedQuery<SpaceGroupsQuery>(
        graphql`
            query SpaceGroupsQuery($id: Int!, $spaceCount: Int!, $spaceCursor: String, $project: Boolean!) {
                space(spaceId: $id) {
                    spaceId
                    ...SpaceGroups_groups @skip(if: $project)
                    ...SpaceGroups_projects @include(if: $project)
                    ...SubspaceSearchResultsFragment
                    permissions {
                        canCreateGroups
                        canCreateProjects
                    }
                }
            }
        `,
        queryRef
    )

    const permissions = space?.permissions

    const subgroupInfo: any = usePaginationFragment(
        graphql`
            fragment SpaceGroups_groups on Space      
            @refetchable(queryName: "SpaceGroupsPaginationQuery") {
                numSubgroups: numSpaces(filters: {project: false})
                groups: spaces(first: $spaceCount, after: $spaceCursor, filters: {project: false}) @connection(key: "SpaceGroups_groups") {       
                    __id   
                    edges {
                        node {
                            ...SpaceListItemFragment
                        }
                    }
                    ...SpaceListFragment
                }
            }
        `,
        project ? null : space
    )

    const subGroupConnectionId = subgroupInfo?.data?.groups.__id;

    const projectInfo: any = usePaginationFragment(
        graphql`
            fragment SpaceGroups_projects on Space
            @refetchable(queryName: "SpaceGroupsProjectsPaginationQuery") {
                numProjects: numSpaces(filters: {project: true})
                projects: spaces(first: $spaceCount, after: $spaceCursor, filters: {project: true}) @connection(key: "SpaceGroups_projects") {      
                    edges {
                        node {
                            ...SpaceListItemFragment
                        }
                    }
                    ...SpaceListFragment
                }
            },
        `,
        project ? space : null
    )

    const projectConnectionId = projectInfo?.data?.projects.__id;

    const spaceTypes: {loadMore: () => void, type: string, edges: any[], pageInfo: any}[] = []

    let count;
    if (project) {
        const {projects, numProjects} = projectInfo.data;
        const {pageInfo, edges, } = projects;
        spaceTypes.push({
            type: 'Projects',
            loadMore: () => projectInfo.loadNext(20),
            pageInfo,
            edges
        })
        count = numProjects;
    } else {
        const {groups, numSubgroups} = subgroupInfo.data;
        const {pageInfo, edges, } = groups;
        spaceTypes.push({
            type: 'Subgroups',
            loadMore: () => subgroupInfo.loadNext(20),
            pageInfo,
            edges
        })
        count = numSubgroups;
    }

    console.log(spaceTypes)

    const [state, setState] = React.useState({
        query: ''        
    })
    
    const searchGroups = (query: string) => {
        setState({
            ...state,
            query
        })
    }
    
    return (
        <div>
            <Card style={{marginBottom: 20, position: 'relative'}}>
                <CardHeader
                    title={
                        <CardTitleCount
                            count={count}
                            title={project ? 'Projects' : 'Groups'}
                        />
                    }
                />
                <div style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 15}}>
                    <SearchButtonBar
                        search={searchGroups}
                        type={project ? 'Projects' : 'Groups'}
                        button={
                            ((permissions.canCreateGroups && !project) || (permissions.canCreateGroups && project)) && 
                            <CreateSpaceButton
                                parentSpaceId={space.spaceId}
                                connectionIds={project ? [projectConnectionId] : [subGroupConnectionId]}
                                project={project}
                            />
                        }
                    />
                    {
                        state.query.length === 0 ?
                        spaceTypes.map(({type, edges, pageInfo, loadMore}) => (
                            <div>
                                {
                                    edges.length === 0 &&
                                    <Typography style={{marginLeft: 4}}>No {type}</Typography>
                                }
                                {
                                    edges.map((e: any) => (
                                        <SpaceListItem
                                            space={e.node}
                                            spaceIconProps={{
                                                size: 45
                                            }}
                                            style={{paddingLeft: 10, paddingRight: 10}}
                                        />
                                    ))
                                }
                                <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                                    {
                                        pageInfo.hasMore && 
                                        <ExpandButton
                                            onClick={loadMore}
                                        />
                                    }
                                </div>
                            </div> 
                        ))
                        :
                        <Suspense
                            fallback={<SearchLoader/>}
                        >
                            <SpaceGroupsSearchResults
                                project={!!project}
                                space={space}
                                query={state.query}
                            />
                        </Suspense>
                    }
                </div>
            </Card>
        </div>
    )
}
