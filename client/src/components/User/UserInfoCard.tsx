import React from 'react'
import { connection, user } from '../../types/user'
import ImageList from '@material-ui/core/ImageList';
import { Button, Card, CardHeader, Typography } from '@material-ui/core';
interface ConnectionsCardProps {
    user: user
}

/*
sections
overview
    Workplace
    high school
    college
    current city
    hometown
Places lived
    current city
    hometown
    city
Contact and base info
    phone
    email
Details about you
    Details about you 
    Name pronunciation
    Favorite quotes
*/

export default function ConnectionsCard(props: ConnectionsCardProps) {
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
                            About
                        </Typography>
                    </div>
                    
                }
            />
           
        </Card>
    )
}
