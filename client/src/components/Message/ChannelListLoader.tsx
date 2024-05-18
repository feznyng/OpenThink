import { Skeleton } from '@material-ui/lab'
import React from 'react'

export default function ChannelListLoader() {
    return (
        <div style={{width: '100%'}}>
            <Skeleton style={{height: 80}}/>
            <div style={{paddingLeft: 5, paddingRight: 5}}>
                <Skeleton style={{height: 40}}/>
                <Skeleton style={{height: 40, marginTop: -10}}/>
                <Skeleton style={{height: 40, marginTop: -10}}/>
            </div>
            
        </div>
    )
}
