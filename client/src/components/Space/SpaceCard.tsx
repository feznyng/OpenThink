import React, { CSSProperties } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Card, CardContent, CardHeader, CardProps, Chip } from '@material-ui/core';
import BannerImage from '../Shared/BannerImage';
import Typography from '../Shared/Typography';
import JoinButton from './JoinButton';
import { AccessTime } from '@material-ui/icons';
import { primaryColor } from '../../theme';
import LastUpdatedTag from './LastUpdatedTag';
import { useHistory } from 'react-router';
import Link from '../Shared/Link';

export interface SpaceCardProps {
    space: any,
    style?: CSSProperties,
    onClick?: (spaceId: number) => void,
    hideDescription?: boolean
}
export default function SpaceCard({space, style, hideDescription, onClick}: SpaceCardProps) {
    const {name, spaceId, description, numUsers, address, ...data} = useFragment(
        graphql`
            fragment SpaceCardFragment on Space {
                name
                spaceId
                description
                address
                numUsers
                ...BannerImageFragment
                ...JoinButtonFragment
                ...LastUpdatedTagFragment
            }
        `,
        space
    )

    const history = useHistory()

    return (
        <Link
            to={onClick ? null : `/space/${spaceId}`}
            style={{textDecoration: 'none'}}
        >
            <Card 
                style={{
                    width: '100%',
                    height: 375,
                    textDecoration: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    ...style, 
                }}
                onClick={() => onClick && onClick(spaceId!!)}
            >
                <div style={{position: 'relative'}}>
                    <BannerImage
                        data={data}
                        style={{height: 150, width: '100%', objectFit: 'cover'}}
                    />
                    <LastUpdatedTag
                        space={data}
                        style={{position: 'absolute', top: 0, right: 0, padding: 5, paddingRight: 10}}
                    />
                </div>
                    
                <CardContent style={{textAlign: 'left', marginBottom: 10, marginTop: -10}}>
                    <Typography variant="h6" clickable>
                        {name}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary" style={{fontWeight: 'normal', marginBottom: 10}}>
                    {`${numUsers} member${numUsers > 1 ? 's' : ''} ${address ? `\u2022 ${address}` : ''}`}
                    </Typography>
                    {
                        !hideDescription && 
                        <div style={{height: 70}}>
                            <Typography style={{fontWeight: 'normal'}}>
                                {description && `${description.substring(0, 75)}${description.length > 75 ? '...' : ''}`}
                            </Typography>
                        </div>
                    }
                
                </CardContent>
                <div style={{height: 42}}/>
                <div style={{position: 'absolute', height: 42, bottom: 10, width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <div style={{width: 200}} onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
                        <JoinButton
                            space={data}
                            fullWidth
                        />
                    </div>
                </div>
            </Card>
        </Link>
    )
}
