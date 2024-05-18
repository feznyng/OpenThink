import React from 'react'
import { connection, user } from '../../types/user'
import ImageList from '@material-ui/core/ImageList';
import { Button, Card, CardHeader, Typography } from '@material-ui/core';
import EventsCard from './EventsCard';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
interface UserEventsProps {
    user: user
}

export default function UserEvents(props: UserEventsProps) {
    const {
        currUser,
        currUserEvents
    } = useSelector((state: RootState) => state.userActions);
    return (
        <div style={{display: 'flex', justifyContent: 'center', height: '100%'}}>
            <div style={{maxWidth: 900, width: '100%'}}>
                <EventsCard
                    events={currUserEvents ? currUserEvents : []}
                />
            </div>
       </div>
    )
}
