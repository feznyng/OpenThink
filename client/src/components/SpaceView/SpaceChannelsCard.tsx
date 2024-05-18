import { Card, CardContent, CardHeader } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense } from 'react';
import { usePaginationFragment } from 'react-relay';
import { room } from '../../types/message';
import ChannelListOptionsMenu from '../Message/ChannelListOptionsMenu';
import RoomSearchResults from '../Message/RoomSearchResults';
import { Anchor } from '../Post/PostContentEditor';
import Typography from '../Shared/Typography';
import SearchButtonBar from '../Space/SearchButtonBar';
import SpaceChannelListItem from '../Space/SpaceChannelListItem';
import CreateSpaceChannelButton from './CreateSpaceChannelButton';
import { SpaceChannelsCardFragment$key } from './__generated__/SpaceChannelsCardFragment.graphql';
import { SpaceChannelsCardFragmentQuery } from './__generated__/SpaceChannelsCardFragmentQuery.graphql';

/**
 * TODO:
 * - Get accurate channel count
 * - Infinite List channels with user count, 
 */


interface SpaceChannelsCardProps {
    space: any
}

interface SpaceChannelsCardState {
    query: string,
    roomContext: room | null,
    anchorEl: Anchor
}

export default function SpaceChannelsCard({space}: SpaceChannelsCardProps) {
    const {data} = usePaginationFragment<SpaceChannelsCardFragmentQuery, SpaceChannelsCardFragment$key>(
        graphql`
            fragment SpaceChannelsCardFragment on Space
            @refetchable(queryName: "SpaceChannelsCardFragmentQuery") {
                numRooms
                spaceId
                ...CreateSpaceChannelButtonFragment
                ...RoomSearchResultsFragment
                rooms(first: $roomCount, after: $roomCursor) @connection(key: "SpaceChannelsCard_rooms") {
                        __id
                        edges {
                            node {
                                ...SpaceChannelListItemFragment
                            }
                        }
                    }
            }
        `,
        space
    )
        
    const connectionId = data?.rooms?.__id

    const [state, setState] = React.useState<SpaceChannelsCardState>({
        query: '',
        anchorEl: null,
        roomContext: null
    })

    const searchRooms = (query: string) => {
        setState({
            ...state,
            query
        })
    }

    const onMenu = () => {
        
    }

    return (
        <Card>
            <CardHeader
                title={'Channels'}
                titleTypographyProps={{variant: 'h6'}}
            />
            {
                connectionId && data.rooms.edges && 
                <CardContent>
                    <SearchButtonBar
                        search={searchRooms}
                        type={'Channels'}
                        button={
                            <CreateSpaceChannelButton
                                space={data}
                                connectionId={connectionId}
                            />
                        }
                    />
                    {
                        state.query.length === 0 ? 
                        <div>
                            {
                                data.rooms.edges.map(e => (
                                    <SpaceChannelListItem
                                        channel={e!!.node}
                                        onMenu={(e, r) => setState({...state, anchorEl: e.currentTarget, roomContext: r})}
                                    />
                                ))
                            }
                            {
                                data.rooms.edges.length === 0 &&
                                <Typography>
                                    No channels. You can create channels to chat with members of your group.
                                </Typography>
                            }
                        </div>
                        :
                        <Suspense
                            fallback={
                                <div>
                                    {
                                        [1, 2, 3].map(() => (
                                            <Skeleton style={{height: 100}}/>
                                        ))
                                    }
                                </div>
                            }
                        >
                            <RoomSearchResults
                                space={data}
                                query={state.query}
                                onMenu={onMenu}
                            />
                        </Suspense>
                    }
                </CardContent>
            }

            <ChannelListOptionsMenu
                variant="click"
                anchorEl={state.anchorEl}
                onClose={() => setState({...state, anchorEl: null})}
                spaceId={data.spaceId!!}
                disableCreate
                room={state.roomContext}
                index={data.numRooms!!}
                connectionId={connectionId!!}
            />
        </Card>
    )
}
