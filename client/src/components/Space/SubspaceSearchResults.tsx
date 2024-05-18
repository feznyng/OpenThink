import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@material-ui/core';
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpaceListItem from './SpaceListItem';
import { SubspaceSearchResultsQuery } from './__generated__/SubspaceSearchResultsQuery.graphql';
import { SpaceSearchSubgroupsResultsPaginationQuery } from './__generated__/SpaceSearchSubgroupsResultsPaginationQuery.graphql';
import { SubspaceSearchResultsFragment_subgroupResults$key } from './__generated__/SubspaceSearchResultsFragment_subgroupResults.graphql';
import { SpaceSearchProjectsResultsPaginationQuery } from './__generated__/SpaceSearchProjectsResultsPaginationQuery.graphql';
import { SubspaceSearchResultsFragment_projectResults$key } from './__generated__/SubspaceSearchResultsFragment_projectResults.graphql';

interface SubspaceSearchResults {
    space: any,
    project: boolean,
    query: string
}

export default function SubspaceSearchResults({space, query, project}: SubspaceSearchResults) {
    const {spaceId} = useFragment(
        graphql`
            fragment SubspaceSearchResultsFragment on Space {
                spaceId
            }
        `,
        space
    )


    const data = useLazyLoadQuery<SubspaceSearchResultsQuery>(
        graphql`
            query SubspaceSearchResultsQuery($spaceId: Int! $query: String!, $searchCount: Int!, $searchCursor: String, $project: Boolean!) {
                space(spaceId: $spaceId) {
                    ...SubspaceSearchResultsFragment_subgroupResults @skip(if: $project)
                    ...SubspaceSearchResultsFragment_projectResults @include(if: $project)
                }
                
            }
        `,
        {spaceId, query, searchCount: 20, project}
    )

    const subgroupResults = usePaginationFragment<SpaceSearchSubgroupsResultsPaginationQuery, SubspaceSearchResultsFragment_subgroupResults$key>(
        graphql`
            fragment SubspaceSearchResultsFragment_subgroupResults on Space 
            @refetchable(queryName: "SpaceSearchSubgroupsResultsPaginationQuery") {
                searchSubgroups: spaces(first: $searchCount, after: $searchCursor, filters: {project: false, query: $query}) @connection(key: "SubspaceGroupsSearchResultsFragment_searchSubgroups") {
                    edges {
                        node {
                            ...SpaceListItemFragment
                        }
                    }
                    pageInfo { 
                        hasNextPage
                    }
                }
            }
        `,
        project ? null : data.space
    )

    const projectResults = usePaginationFragment<SpaceSearchProjectsResultsPaginationQuery, SubspaceSearchResultsFragment_projectResults$key>(
        graphql`
            fragment SubspaceSearchResultsFragment_projectResults on Space 
            @refetchable(queryName: "SpaceSearchProjectsResultsPaginationQuery") {
                searchProjects: spaces(first: $searchCount, after: $searchCursor, filters: {project: true, query: $query}) @connection(key: "SubspaceProjectsSearchResultsFragment_searchProjects") {
                    edges {
                        node {
                            ...SpaceListItemFragment
                        }
                    }
                    pageInfo { 
                        hasNextPage
                    }
                }
            }
        `,
        project ? data.space : null
    )

    let connection = project ? projectResults : subgroupResults
    const loadNext = connection.loadNext;
    const connectionData = project ? projectResults.data?.searchProjects : subgroupResults.data?.searchSubgroups
    const pageInfo = connectionData?.pageInfo;

    return (
        <div>
            <InfiniteScroll
                hasMore={!!pageInfo?.hasNextPage}
                loader={<CircularProgress/>}
                dataLength={connectionData?.edges?.length ? connectionData.edges.length : 0}
                next={() => loadNext(20)}
            >
                {
                    connectionData?.edges && connectionData.edges.map((e: any) => (
                        <SpaceListItem
                            style={{marginBottom: 15, paddingLeft: 0}}
                            space={e.node}
                        />
                    ))
                }
            </InfiniteScroll>
        </div>
    )
}
