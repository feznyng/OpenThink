import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import SpaceInfoCard from '../Space/SpaceInfoCard';
import graphql from 'babel-plugin-relay/macro';
import SpacePeopleCard from '../SpaceView/SpacePeopleCard';
import { TaskOverviewQuery } from './__generated__/TaskOverviewQuery.graphql';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';

interface TaskOverviewProps {
    queryRef: any
}

export default function TaskOverview({queryRef}: TaskOverviewProps) {
    const {space} = usePreloadedQuery<TaskOverviewQuery>(
        graphql`
            query TaskOverviewQuery($spaceId: Int!, $stratified: Boolean!, $userCount: Int!, $modCursor: String, $memberCursor: String) {
                space(spaceId: $spaceId) {
                    ...SpaceInfoCardFragment
                    ...SpacePeopleCardFragment
                }
            }
        `,
        queryRef
    )

    return (
        <MaxWidthWrapper width={600}>
            <SpaceInfoCard
                space={space}
                style={{marginTop: 15}}
            />
            <SpacePeopleCard
                space={space}
                style={{marginTop: 15}}
            />
        </MaxWidthWrapper>
    )
}
