import React from 'react'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {Typography} from '@material-ui/core'
export default function PriorityIcon(props) {
    const {level, detailed} = props;
    const colors = ['#f0f0f0', '#33cc33', '#ff9933', '#ff3300'];
    const labels = ['None', 'Low', 'Medium', 'High'];

    return (
        <div style={{display: 'flex'}}>
            {
                detailed ? 
                <span style={{display: 'flex'}}>
                <FiberManualRecordIcon style={{color: colors[level]}}/> 
                <Typography>{labels[level]}</Typography>
                </span>
                :
                <FiberManualRecordIcon style={{color: colors[level]}}/>
            }
        </div>
    )
}
