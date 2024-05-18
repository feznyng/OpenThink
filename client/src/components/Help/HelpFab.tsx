import { Fab, IconButton } from '@material-ui/core'
import { Chat, Close, Email, Feedback, Help } from '@material-ui/icons'
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'
import React, { CSSProperties } from 'react'

interface HelpFabProps {
    style?: CSSProperties
}

const actions = [
    {
        name: 'Get Help',
        icon: <Email/>
    },
    {
        name: 'Leave Feedback',
        icon: <Feedback/>
    },
]

export default function HelpFab({style}: HelpFabProps) {
    const menuAction = (name: string) => {
        switch(name) {
            case 'Get Help':
                window.open("mailto:ajanprabakar@gmail.com?subject=Openthink Feedback&cc=nathandkessel@gmail.com",'emailWindow');
                break
            case 'Leave Feedback':
                window.open("https://forms.gle/7jXpDWvg1qmkhVFh7",'feedbackWindow');
        }
    }

    return (
        <Fab onClick={() => menuAction('Leave Feedback')} size="small" color="secondary">
            <Chat/>
        </Fab>
    )
}
