import React from 'react'
import { Typography, Card } from '@material-ui/core';
import SpacePreview from './SpacePreviewButton';

export default function AlliedGroupsCard({space}) {
    return (
        <Card style={{textAlign: 'left'}}>
            <div style={{margin: 20}}>
                <Typography variant="h6">
                    Allied Groups
                </Typography>
                <div style={{display: 'flex', marginTop: 20}}>
                    {
                        space.related_spaces.filter(s => s.space_id !== space.space_id).map(s => (
                            <span style={{marginRight: 10}}>
                                <SpacePreview s={s} expanded/>
                            </span>
                            
                        ))
                    }
                </div>
            </div>
        </Card>
    )
}
