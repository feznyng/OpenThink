import React from 'react'
import { Link } from 'react-router-dom'
import { Typography } from '@material-ui/core'
export default function NotFound() {
    return (
        <div style={{marginTop: 10}}>
            <Typography variant="h5">
                Page Not Found
            </Typography>
            <Typography>
                We couldn't find the page you're looking for. You can go back home <Link to={'/'}>here</Link>
            </Typography>
        </div>
    )
}
