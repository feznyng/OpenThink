import { CircularProgress } from '@material-ui/core'
import React from 'react'

export default function MessagesPlaceholder() {
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh', width: '100vw'}}>
            <CircularProgress/>
        </div>
    )
}
