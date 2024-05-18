import { CircularProgress } from '@material-ui/core'
import React from 'react'

export default function SpaceInfoLoader() {
    return (
        <div style={{minHeight: 100}}>
            <CircularProgress/>
        </div>
    )
}
