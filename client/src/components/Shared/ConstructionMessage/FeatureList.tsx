import { Typography } from '@material-ui/core';
import React from 'react';

export interface feature {
    title: string,
    description?: string,
    onClick?: () => void
}

interface FeatureListProps {
    features: feature[],
    style?: React.CSSProperties
}

export default function FeatureList({style, features}: FeatureListProps) {
    return (
        <div style={{display: 'flex', justifyContent: 'center', ...style}}>
            <ul>
                {
                    features.map(f => (
                        <li style={{marginTop: 5, marginBottom: 5}}>
                            <Typography variant="body2" style={{textAlign: 'left'}}>
                                {f.title}
                            </Typography>
                            
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
