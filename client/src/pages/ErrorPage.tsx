import { Button, Typography } from '@material-ui/core'
import React from 'react'

export default function ErrorPage() {
    return (
        <div style={{textAlign: 'center'}}>
            <Typography variant="h5">
                Something went wrong.
            </Typography>
            <Button onClick={() => window.location.reload()} style={{textTransform: 'none'}}>
                Try Reloading
            </Button>
        </div>
    )
}
