import { ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import React from 'react'
import {attribute} from '../../../types/post';
import AttributeIcon from './AttributeIcon';

export default function AttributeLabel({attribute}: {attribute: attribute}) {
    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <AttributeIcon
                attribute={attribute}
            />
            <Typography
                style={{fontSize: 12, marginLeft: 5}}
            >
                {attribute.name}
            </Typography>
        </div>
    )
}
