import { ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import React from 'react'
import {attribute} from '../../types/post';
import AttributeIcon from './AttributeIcon';

export default function AttributeLabel({attribute}: {attribute: attribute}) {
    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <AttributeIcon
                attribute={attribute}
            />
            <Typography
                variant="subtitle2"
                style={{marginLeft: 5}}
            >
                {attribute.name}
            </Typography>
        </div>
    )
}
