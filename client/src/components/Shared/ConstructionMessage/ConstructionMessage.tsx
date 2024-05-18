import { Typography, Button } from '@material-ui/core';
import React from 'react';
import FeatureList, { feature } from './FeatureList';
import ReactGA, { EventArgs } from 'react-ga';

interface ConstructionMessageProps {
    features?: feature[],
    event?: EventArgs
}

export default function ConstructionMessage({features, event}: ConstructionMessageProps) {
    return (
        <div style={{paddingTop: '10vw', textAlign: 'center'}}>
            <Typography variant="h3">
                🏗️ Under Construction...
            </Typography>
            <Typography variant="body2" style={{marginTop: 20}}>
                We're currently working on this feature. We'll let you know when it's ready!
            </Typography>
            {
                features && 
                <React.Fragment>
                    <Typography variant="body2" style={{marginTop: 20}}>
                        Here's what we have planned:
                    </Typography>
                    <FeatureList
                        style={{marginTop: 20}}
                        features={features}
                    />
                </React.Fragment>
            }
            
           
        </div>

    )
}
