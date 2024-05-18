import { Skeleton } from '@material-ui/lab'
import React from 'react'

export default function SearchLoader() {
    return (
        <div>
            <Skeleton />
            <Skeleton animation="wave" />
            <Skeleton animation={false} />
        </div>
    )
}
