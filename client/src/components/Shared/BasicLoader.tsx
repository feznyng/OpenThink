import { CircularProgress } from '@mui/material'
import React from 'react'

export default function BasicLoader() {
    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <CircularProgress/>
        </div>
    )
}
