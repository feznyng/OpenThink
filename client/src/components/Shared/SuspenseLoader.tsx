import { CircularProgress } from '@material-ui/core'
import React, {ReactElement, Suspense} from 'react'
import { PreloadedQuery } from 'react-relay'
import { OperationType } from 'relay-runtime'

interface SuspenseLoaderProps {
    fallback?: ReactElement | ReactElement[],
    queryRef: PreloadedQuery<OperationType> | undefined | null,
    children: ReactElement | ReactElement[],
}

export default function SuspenseLoader({fallback = <CircularProgress/>, children, queryRef}: SuspenseLoaderProps) {
    return (
        <Suspense
            fallback={fallback}
        >
            {
                (queryRef || queryRef === undefined) ? 
                children
                :
                fallback
            }
        </Suspense>
    )
}
