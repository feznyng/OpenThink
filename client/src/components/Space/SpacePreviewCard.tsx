import React from 'react'
import { CardContent } from '@material-ui/core'
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import SpaceIcon from './SpaceIcon';
import Typography from '../Shared/Typography';
import JoinButton from './JoinButton';
import SpaceMessageButton from './SpaceMessageButton';
import SpaceParamsCard from './SpaceParamsInfo';
import type { SpacePreviewCardQuery } from './__generated__/SpacePreviewCardQuery.graphql';

interface SpacePreviewCardProps {
    spaceId: number
}

export default function SpacePreviewCard({spaceId}: SpacePreviewCardProps) {
    const {space} = useLazyLoadQuery<SpacePreviewCardQuery>(    
        graphql`      
            query SpacePreviewCardQuery($spaceId: Int!) {   
                space(spaceId: $spaceId) {
                    name
                    description
                    type
                    accessType
                    ...SpaceIconFragment
                    ...JoinButtonFragment
                    ...SpaceMessageButtonFragment
                    ...SpaceParamsInfoFragment
                }
            }
        `,    
        {spaceId}
    );

    const {description, name} = space!!;

    return (
        <React.Fragment>
            {
                space && 
                
                    <div style={{width: 400, paddingTop: 20, position: 'relative'}}>
                        <CardContent style={{textAlign: 'left', display: 'flex',}}>
                            <SpaceIcon
                                space={space}
                                size={80}
                            />
                            <div style={{marginLeft: 20}}>
                                <Typography variant="h5">{name}</Typography>
                                <Typography 
                                    variant="body1" 
                                    truncate={100} 
                                    style={{marginTop: 10}}
                                    expandDisabled
                                >
                                    {description}
                                </Typography>
                                <SpaceParamsCard
                                    variant="small"
                                    space={space}
                                />
                            </div>
                        </CardContent>
                       
                        <div
                            style={{height: 75}}
                        />
                        <div style={{position: 'absolute', bottom: 15, width: '100%', paddingLeft: 15, paddingRight: 15}}>
                            <div style={{display: 'flex', alignItems: "center", width: '100%'}}>
                                <JoinButton
                                    space={space}
                                    style={{width: '100%', marginRight: 10}}
                                />
                                <SpaceMessageButton
                                    style={{width: '100%'}}
                                    fullWidth
                                    spaceData={space}
                                />
                            </div>
                            
                        </div>
                    </div>
            }
        </React.Fragment>
    )
}
