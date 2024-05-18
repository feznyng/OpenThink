import { CircularProgress } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React, { MouseEvent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { room } from '../../types/message';
import { Anchor } from '../Post/PostContentEditor';
import Typography from '../Shared/Typography';
import SpaceChannelListItem from '../Space/SpaceChannelListItem';
import { RoomSearchResultsFragment_roomResults$key } from './__generated__/RoomSearchResultsFragment_roomResults.graphql';
import { RoomSearchResultsPaginationQuery } from './__generated__/RoomSearchResultsPaginationQuery.graphql';
import { RoomSearchResultsQuery } from './__generated__/RoomSearchResultsQuery.graphql';

interface RoomSearchResults {
    space: any,
    query: string,
    onMenu: (e: MouseEvent, r: room) => void
}

export default function RoomSearchResults({space, onMenu, query}: RoomSearchResults) {
    const {spaceId, numRooms} = useFragment(
        graphql`
            fragment RoomSearchResultsFragment on Space {
                spaceId
                numRooms
            }
        `,
        space
    )


    const data = useLazyLoadQuery<RoomSearchResultsQuery>(
        graphql`
            query RoomSearchResultsQuery($spaceId: Int! $query: String!, $searchCount: Int!, $searchCursor: String) {
                space(spaceId: $spaceId) {
                    __id
                    ...RoomSearchResultsFragment_roomResults
                }
                
            }
        `,
        {spaceId, query, searchCount: 20}
    )

    const roomResults = usePaginationFragment<RoomSearchResultsPaginationQuery, RoomSearchResultsFragment_roomResults$key>(
        graphql`
            fragment RoomSearchResultsFragment_roomResults on Space 
            @refetchable(queryName: "RoomSearchResultsPaginationQuery") {
                searchRooms(first: $searchCount, after: $searchCursor, query: $query) @connection(key: "RoomSearchResultsFragment_searchRooms") {
                    edges {
                        node {
                            ...SpaceChannelListItemFragment
                        }
                    }
                    pageInfo{
                        hasNextPage
                    }
                }
            }
        `,
       data.space
    )

    const roomData = roomResults.data
    const edges = roomData?.searchRooms?.edges

    const [state, setState] = React.useState<{anchorEl: Anchor, roomContext: null | room}>({
        anchorEl: null,
        roomContext: null
    })

    return (
        <div>
            <InfiniteScroll
                hasMore={!!roomData?.searchRooms?.pageInfo?.hasNextPage}
                loader={<CircularProgress/>}
                dataLength={edges ? edges.length : 0}
                next={() => roomData ? roomResults.loadNext(20) : {}}
            >
                {
                    edges && edges.map((e: any) => (
                        <SpaceChannelListItem
                            channel={e.node}
                            onMenu={onMenu}
                        />
                    ))
                }
            </InfiniteScroll>
            {
                edges?.length === 0 &&
                <Typography>
                    No channels
                </Typography>
            }
        </div>
    )
}
