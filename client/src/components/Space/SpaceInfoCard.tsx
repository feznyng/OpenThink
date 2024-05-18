import { Card, CardContent, CardHeader, Link } from '@material-ui/core'
import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Typography from '../Shared/Typography'
import SpaceStats from './SpaceStats';
import SpaceParamsCard from './SpaceParamsInfo';
import { useHistory } from 'react-router';

interface SpaceInfoCardProps {
    space: any,
    style?: React.CSSProperties,
    truncate?: boolean
}

const MAX_DESC_LENGTH = 100;

export default function SpaceInfoCard({space, truncate, ...props}: SpaceInfoCardProps) {
    const {spaceId, description, accessType, project, ...data} = useFragment(
        graphql`
            fragment SpaceInfoCardFragment on Space {
                spaceId
                description
                accessType
                project
                ...SpaceParamsInfoFragment
                ...SpaceStatsFragment
            }
        `,
        space
    )

    const history = useHistory()

    return (
        <Card
            {...props}
        >
            <CardHeader
                title={'About'}
                titleTypographyProps={{variant: 'h6', style: {cursor: 'pointer'}}}
                onClick={() => truncate && history.push(`/space/${spaceId}/about`)}
            />
            <CardContent style={{marginTop: -25}}>
                <Typography
                    truncate={truncate ? MAX_DESC_LENGTH : undefined}
                >
                    {description}
                </Typography>
                <SpaceParamsCard
                    space={data}
                    style={{marginTop: 20}}
                />
                <div>
                    
                </div>

                {
                    !truncate && 
                    <div
                        style={{marginTop: 20}}
                    >
                        <SpaceStats
                            space={data}
                        />
                    </div>
                }
                

                {
                    /*
                    {
                    address &&
                    <React.Fragment>
                    <Divider orientation="vertical" flexItem style={{marginLeft: '10px'}} />
                    <Typography style={{fontSize: '15px', marginLeft: '10px'}}>
                    <LocationOn/> {address}
                    </Typography>         
                    </React.Fragment>
                }
                {
                    (tags && tags.length > 0) || (topics && topics.length > 0) && 
                    <React.Fragment>
                    <Divider orientation="vertical" flexItem style={{marginLeft: '10px'}} />
                    <Typography style={{fontSize: '15px', marginLeft: '10px'}}>
                    <EmojiObjects/> {(topics && topics.length > 0) ? topics[0] : tags[0]}
                    </Typography>         
                    </React.Fragment>
                }
                    */
                }
            </CardContent>
        </Card>
    )
}
