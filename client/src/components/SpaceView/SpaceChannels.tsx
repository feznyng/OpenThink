import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import SpaceChannelsCard from './SpaceChannelsCard';
import { SpaceChannelsQuery as SpaceChannelsQueryType } from './__generated__/SpaceChannelsQuery.graphql';

interface SpaceChannelsProps {
    queryRef: any
}

// space channels, meetings, streams, live posts by most recent

export function SpaceChannels({queryRef}: SpaceChannelsProps) {
    const {space} = usePreloadedQuery<SpaceChannelsQueryType>(
        graphql`      
            query SpaceChannelsQuery($id: Int!, $roomCount: Int, $roomCursor: String) {   
                space(spaceId: $id) {name
                    ...SpaceChannelsCardFragment
                }
            }
        `,
        queryRef
    );
    
    return (
        <MaxWidthWrapper
            width={700}
        >            
            <SpaceChannelsCard
                space={space}
            />
        </MaxWidthWrapper>
        
    )
}