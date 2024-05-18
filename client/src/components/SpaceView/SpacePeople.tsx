import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import SpacePeopleCard from './SpacePeopleCard';
import { SpacePeopleQuery } from './__generated__/SpacePeopleQuery.graphql';

interface SpacePeopleProps {
    queryRef: any,
    truncate?: boolean
}
export default function SpacePeople({queryRef, truncate}: SpacePeopleProps) {
    const {space} = usePreloadedQuery<SpacePeopleQuery>(
        graphql`
            query SpacePeopleQuery($id: Int!, $userCount: Int!, $modCursor: String, $stratified: Boolean!, $memberCursor: String) {
                space(spaceId: $id) {
                    ...SpacePeopleSearchResultsFragment
                    ...InviteButtonFragment_space
                    ...SpaceMembersFragment
                    ...SpacePeopleCardFragment
                    numUsers
                }
            }
        `,
        queryRef
    )

    const [state, setState] = React.useState({
        query: ''
    })

    return (
        <div>
            <SpacePeopleCard
                space={space}
                stratified
            />
        </div>
    )
}
