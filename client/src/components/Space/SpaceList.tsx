import React, { CSSProperties } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpaceListItem, { SpaceListItemProps } from './SpaceListItem';
import SpaceCard from './SpaceCard';
import { Grid } from '@mui/material';
import Typography from '../Shared/Typography';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import Button from '../Shared/Button';

interface SpaceListProps {
    spaces: any,
    selectedSpaceIds?: number[],
    grid?: boolean,
    gridProps?: {
        style?: CSSProperties,
        centered?: boolean
    },
    spaceListItemProps?: Partial<SpaceListItemProps>,
    style?: CSSProperties,
    emptyMessage?: string,
    maxLength?: number,
}

export default function SpaceList({spaces, selectedSpaceIds, maxLength, emptyMessage, style, grid, gridProps, spaceListItemProps}: SpaceListProps) {
    const {edges} = useFragment(
        graphql`
            fragment SpaceListFragment on SpaceConnection {
                edges {
                    node {
                        spaceId
                        ...SpaceListItemFragment
                        ...SpaceCardFragment
                    }
                }
            }   
        `,
        spaces
    )
        
    return (
        <div style={style}>
            {
                edges.length === 0 &&
                <Typography variant="h6">
                    {emptyMessage}
                </Typography>
            }
            {
                grid ?
                <Grid container spacing={3} style={{...gridProps?.style, ...(gridProps?.centered ? {display: 'flex', justifyContent: 'center'} : {})}}>
                    {
                        edges.slice(0, maxLength ? maxLength : edges.length).map((e: any) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
                                <SpaceCard
                                    {...spaceListItemProps}
                                    space={e.node}
                                />
                            </Grid>
                        ))
                    }
                </Grid>
                :
                edges.slice(0, maxLength ? maxLength : edges.length).map((e: any) => (
                    <SpaceListItem
                        {...spaceListItemProps}
                        space={e.node}
                        selected={selectedSpaceIds?.includes(e.node.spaceId)}
                    />
                ))
            }
        </div>
    )
}
