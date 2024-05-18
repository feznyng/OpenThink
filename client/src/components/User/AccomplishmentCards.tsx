import React from 'react'
import { connection, user } from '../../types/user'
import ImageList from '@material-ui/core/ImageList';
import { Button, Card, CardHeader, Typography } from '@material-ui/core';
interface AccomplishmentCardProps {
    accomplishments: any[]
}

export default function AccomplishmentCard(props: AccomplishmentCardProps) {
    const {
        accomplishments
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
                            Accomplishments
                        </Typography>
                    </div>
                    
                }
            />
           
        </Card>
    )
}
