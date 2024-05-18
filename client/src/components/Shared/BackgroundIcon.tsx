import { Avatar } from '@material-ui/core';
import React, {ReactElement, CSSProperties} from 'react';
import { primaryColor } from '../../theme';

interface BackgroundIconProps {
    Icon: any,
    style?: CSSProperties,
    selected: boolean
}

export default function BackgroundIcon({Icon, selected, style}: BackgroundIconProps) {
    return (
        <Avatar style={{backgroundColor: selected ? primaryColor : 'lightgrey'}}>
            <Icon style={{color: selected ? "white" : 'black'}}/>
        </Avatar>
    )
}
