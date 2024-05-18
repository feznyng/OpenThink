import React from 'react'
import { connection, user } from '../../types/user'
import ImageList from '@material-ui/core/ImageList';
import { Button, Card, CardHeader, Typography } from '@material-ui/core';
interface ExperienceCardProps {
    user: user
}

export default function ExperienceCard(props: ExperienceCardProps) {
    const {
        user
    } = props;
    return (
        <Card style={{width: "100%", textAlign: 'left'}}>
            <CardHeader
                title={ 
                    <div>
                        <Typography
                            variant="h6"
                            style={{float: 'left', fontSize: 22, fontWeight: 'bold'}}
                        >
                            Experience
                        </Typography>
                    </div>
                    
                }
            />
           
        </Card>
    )
}
