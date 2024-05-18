import { Typography, useTheme } from '@material-ui/core'
import React from 'react'
import { room } from '../../types/message'
import UserIcon from '../User/UserIconOld'
import RoomIcon from './RoomIcon'

interface ChannelHeaderProps {
    room: room   
}

export default function ChannelHeader({room}: ChannelHeaderProps) {
    const { name } = room;
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'

    let startHeader = ''
    let startMessage = ''
    let roomIcon = null;
    if (room.spaceId) {
        startHeader = `Welcome to #${name}`
        startMessage = `This is the start of the ${name} channel.`
        roomIcon = (
            <div style={{backgroundColor: darkMode ? '#4F545C' : 'darkgrey', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'}}> 
                <Typography variant='h4' style={{fontSize: 60}}>
                    #
                </Typography>
            </div>
        )
    } else {
        if (!room.spaceId) {
            let otherUser = null;
            if (room.dm) {
                startMessage = `This is the beginning of your direct message history${room.otherUser ? ` with ${room.otherUser.firstname}` : ''}.`

            } else {

                startMessage = `Welcome to the beginning of the ${room.name} group.`

                roomIcon = <RoomIcon room={room}/>
            }
            roomIcon = <UserIcon user={otherUser ? otherUser : null}/>
        } 
    }

    return (
        <div>
            <div style={{marginBottom: 5}}>
                {roomIcon}
            </div>
            <Typography variant="h3" style={{marginBottom: 10}}>{name}</Typography>
            <Typography style={{marginBottom: 15}}>{startMessage}</Typography> 
        </div>
    )
}
