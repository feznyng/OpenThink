import { Card, CardContent, CardHeader } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import SearchLoader from '../Shared/SearchLoader';
import CardTitleCount from '../Space/CardTitleCount';
import InviteButton from '../Space/InviteButton';
import SearchButtonBar from '../Space/SearchButtonBar';
import SpaceMembers from '../Space/SpaceMembers';
import SpacePeopleSearchResults from '../Space/SpacePeopleSearchResults';
import { SpacePeopleCardQuery } from './__generated__/SpacePeopleCardQuery.graphql';

interface SpacePeopleCardProps {
    space: any,
    truncate?: boolean,
    stratified?: boolean,
    style?: React.CSSProperties
}

export default function SpacePeopleCard({space, style, stratified, truncate}: SpacePeopleCardProps) {
    const {numUsers, permissions, ...data} = useFragment(
        graphql`
            fragment SpacePeopleCardFragment on Space {
                ...SpacePeopleSearchResultsFragment
                ...InviteButtonFragment_space
                ...SpaceMembersFragment
                numUsers
            }
        `,
        space
    )

    const {me} = useLazyLoadQuery<SpacePeopleCardQuery>(
        graphql`
            query SpacePeopleCardQuery {
                me {
                    userId
                }
            }        
        `,
        {}
    )

    const [state, setState] = React.useState({
        query: ''
    })

    const searchUsers = (query: string) => {
        setState({
            ...state,
            query
        })
    }

    return (
        <Card style={{...style, position: 'relative'}}>
            <CardHeader
                title={
                    <CardTitleCount
                        count={(data && numUsers) ? numUsers : 0}
                        title={'People'}
                    />
                }
            />
            <CardContent>
                {
                    !truncate && 
                    <SearchButtonBar
                        search={searchUsers}
                        type={'People'}
                        button={
                            !!me?.userId ? 
                            <InviteButton
                                space={data}
                            />
                            :
                            null
                        }
                    />
                }
                
                {
                    state.query.length === 0 ?
                    <SpaceMembers
                        space={data}
                        stratified={!!stratified}
                    />
                    :
                    <Suspense
                        fallback={<SearchLoader/>}
                    >
                        <SpacePeopleSearchResults
                            space={data}
                            query={state.query}
                        />
                    </Suspense>
                    
                }
            </CardContent>
        </Card>
    )
}
