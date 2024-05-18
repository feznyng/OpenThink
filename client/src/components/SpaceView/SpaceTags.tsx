import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import SpaceTagsCard from './SpaceTagsCard';
import { SpaceTagsQuery } from './__generated__/SpaceTagsQuery.graphql';


interface SpaceTagsProps {
    queryRef: any
}

export default function SpaceTags({queryRef}: SpaceTagsProps) {
    const {space} = usePreloadedQuery<SpaceTagsQuery>(
        graphql`      
            query SpaceTagsQuery($id: Int!, $tagCount: Int!, $tagCursor: String) {   
                space(spaceId: $id) {
                    name
                    ...SpaceTagsCardFragment
                }
            }
        `,
        queryRef
    );

    return (
        <MaxWidthWrapper
            width={700}
        >
            <SpaceTagsCard
                space={space}
            />
        </MaxWidthWrapper>
    )
}
