import React from 'react';
import {room} from '../../types/message';

interface RoomSettingsProps {
    room: room
}

export default function RoomSettings({
    room
}: RoomSettingsProps) {
    return (
        <div>
            {room.name}
        </div>
    )
}
