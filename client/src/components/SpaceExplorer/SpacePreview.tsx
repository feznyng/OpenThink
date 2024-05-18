import React, { useEffect } from 'react'
import { usePreloadedQuery, useQueryLoader } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { SpacePreviewQuery } from './__generated__/SpacePreviewQuery.graphql'
import SpaceMain from '../SpaceView/SpaceMain';
import SpaceHeader from '../SpaceView/SpaceHeader';
import { CardContent, IconButton } from '@material-ui/core';
import Button from '../Shared/Button';
import { Close } from '@material-ui/icons';
import { useHistory } from 'react-router';
import SpaceInfoQuery from '../SpaceView/__generated__/SpaceInfoQuery.graphql'
import SpaceInfo from '../SpaceView/SpaceInfo';
import SuspenseLoader from '../Shared/SuspenseLoader';
import Typography from '../Shared/Typography';
import JoinButton from '../Space/JoinButton';

interface SpacePreviewProps {
    queryRef: any,
    onClose: () => void
}

export default function SpacePreview({queryRef, onClose}: SpacePreviewProps) {
    const {space, me} = usePreloadedQuery<SpacePreviewQuery>(
        graphql`
            query SpacePreviewQuery($spaceId: Int!) {
                space(spaceId: $spaceId) {
                    ...SpaceHeaderFragment
                    ...SpaceMainFragment
                    ...JoinButtonFragment
                    project
                    spaceId
                    name
                }
                me {
                    ...SpaceMainFragment_me
                }
            }
        `,
        queryRef
    )

    const [    
        infoQueryRef,    
        loadInfoQuery,  
    ] = useQueryLoader(    
        SpaceInfoQuery,
    );

    const history = useHistory()

    useEffect(() => {
        if (space?.spaceId) {
            loadInfoQuery({id: space.spaceId, tagCount: 30})
        }
    }, [space?.spaceId])
    
    return (
        <div style={{position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, top: 0, zIndex: 100, width: '100%'}}>
                <div style={{height: 45, position: 'relative', width: '100%'}}>
                    <IconButton onClick={onClose} size="small" style={{marginLeft: 10, marginTop: 5}}>
                        <Close/>
                    </IconButton>
                    <Button 
                        variant='contained' 
                        color='secondary' 
                        onClick={() => history.push(`/space/${space?.spaceId}`)}
                        size="small"
                        style={{position: 'absolute', right: 15, top: 6}}
                    >
                        Open {space?.project ? 'Project' : 'Group'}
                    </Button>
                </div>
            </div>
            <SpaceHeader
                space={space}
            />
            <CardContent style={{marginTop: 30, position: 'relative'}}>
                <Typography variant="h4" style={{fontWeight: 'bold', marginRight: 70}}>
                    {space?.name}
                </Typography>
                <JoinButton
                    space={space}
                    style={{position: 'absolute', right: 10, top: 20}}
                />
            </CardContent>
            <SuspenseLoader
                queryRef={infoQueryRef}
                fallback={<div/>}
            >
                <SpaceInfo
                    style={{paddingBottom: 30, marginLeft: 5, marginRight: 5}}
                    cardProps={{
                        style: {boxShadow: 'none'}
                    }}
                    queryRef={infoQueryRef}
                />
            </SuspenseLoader>
        </div>
    )
}
