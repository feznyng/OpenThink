import { CircularProgress } from '@material-ui/core'
import React from 'react'

export default function ProfileLoader() {
    return (
        <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center'}}>
            <CircularProgress/>
        </div>
    )
}
