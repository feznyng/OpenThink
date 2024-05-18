import React, { MouseEvent, useState } from 'react'
import GeographicView from '../DatabaseViews/GeographicView'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import { usePreloadedQuery, useQueryLoader } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { SpaceMapQuery } from './__generated__/SpaceMapQuery.graphql'
import { spacebarHeight } from '../Space/SpaceTopbar'
import { getImage } from '../../actions/S3Actions';
import DrawerView from '../Shared/DrawerView';
import SpacePreviewQuery from './__generated__/SpacePreviewQuery.graphql';
import SpacePreview from './SpacePreview';
import SuspenseLoader from '../Shared/SuspenseLoader';
import ProfileLoader from '../Profile/ProfileLoader';
import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import Button from '../Shared/Button';
import { useHistory } from 'react-router';

/**
 * TODO: 
 * - Add sidebar view for space
 */

interface SpaceMapProps {
    queryRef: any
}

interface SpaceMapState {
    spaceId: number | null
}

export default function SpaceMap({queryRef}: SpaceMapProps) {
    const {spaces} = usePreloadedQuery<SpaceMapQuery>(
        graphql`
            query SpaceMapQuery($spaceCount: Int!, $spaceCursor: String) {
                spaces(first: $spaceCount, after: $spaceCursor, filters: {hasLocation: true}) {
                    edges {
                        node {
                            spaceId
                            latitude
                            project
                            longitude
                            address
                            profilepic
                            name
                        }
                    }
                }
            }
        `,
        queryRef
    )

    const [state, setState] = useState<SpaceMapState>({
        spaceId: null
    })

    const edges = spaces?.edges ? spaces.edges.map(({node: {profilepic, spaceId, latitude, longitude}}: any) => ({
        id: spaceId.toString(),
        position: {
            lat: parseFloat(latitude), 
            lng: parseFloat(longitude)
        },
        icon: profilepic ? getImage(profilepic) : '/assets/space.svg',
        size: 25
    })) : []

    const {height, width} = useWindowDimensions()

    const [    
        spaceQueryRef,    
        loadSpace,  
    ] = useQueryLoader(    
        SpacePreviewQuery,    
    );

    const history = useHistory()

    const onMarkerClick = (e: MouseEvent, id: string) => {
        setState({
            ...state,
            spaceId: parseInt(id)
        })
        loadSpace({spaceId: parseInt(id)})
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            <DrawerView 
                sidebar={
                    <SuspenseLoader
                        queryRef={spaceQueryRef}
                        fallback={<ProfileLoader/>}
                    >
                        <SpacePreview
                            queryRef={spaceQueryRef}
                            onClose={() => setState({...state, spaceId: null})}
                        />
                    </SuspenseLoader>
                }
                open={!!state.spaceId}
                drawerWidth={600}
            > 
                <GeographicView
                    style={{height: height - (62 + spacebarHeight), width: (!!state.spaceId ? width - 600 : width)}}
                    center={{lat: 40, lng: 265}}
                    zoom={4.5}
                    locations={edges}
                    onMarkerClick={onMarkerClick}
                />
           </DrawerView>
        </div>
    )
}
