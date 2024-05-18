import React from 'react'
import { post } from '../../types/post'

interface EventsListProps {
    events: post[]
}

export default function EventsList(props: EventsListProps) {
    return (
        <div>
            Events List
        </div>
    )
}
