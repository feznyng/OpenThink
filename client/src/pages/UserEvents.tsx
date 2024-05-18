import { Typography, Divider } from '@material-ui/core';
import React from 'react';
import ConstructionMessage from '../components/Shared/ConstructionMessage/ConstructionMessage';


export default function UserEvents() {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    return (
        <ConstructionMessage
            features={[
                {
                    title: 'View all your events in one convenient location.'
                },
                {
                    title: "Filter your events by group."
                },
                {
                    title: "Sync your events with Google Calendar, Microsoft Outlook, and iCalendar."
                }
            ]}
        />
    )
}
