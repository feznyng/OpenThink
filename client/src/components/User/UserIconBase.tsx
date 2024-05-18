import React, { CSSProperties } from 'react'
import { Avatar, Tooltip } from '@material-ui/core';
import { getImage } from '../../actions/S3Actions';
import { useHistory } from 'react-router';
import { Person } from '@material-ui/icons'

export interface UserIconBaseProps {
    profilepic?: string,
    style?: CSSProperties,
    firstname?: string
    lastname?: string
    size?: number
    clickable?: boolean,
    userId: number,
    showName?: boolean,
    placeholder?: boolean
}

export default function UserIconBase({userId, placeholder, showName, profilepic, style, size, clickable, firstname, lastname}: UserIconBaseProps) {
    const history = useHistory()

    
    return (
        <Tooltip
            title={(!placeholder && showName) ? `${firstname} ${lastname}` : ''}
        >
            <Avatar 
                src={(!placeholder &&profilepic) ? getImage(profilepic) : undefined}
                style={{...style, width: size, height: size, cursor: clickable ? 'pointer' : undefined}}
                onClick={clickable ? () => history.push(`/profile/${userId}`) : undefined}
            > 
                {
                    placeholder ? 
                    <Person/>
                    :
                    <div style={{fontSize: '15px'}}>
                        {(`${firstname} ${lastname}`).split(" ").map((n)=>n[0]).join("")}
                    </div>
                }
               
            </Avatar>
        </Tooltip>
    )
}
