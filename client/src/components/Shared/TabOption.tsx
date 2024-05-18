import React from 'react';
import {Typography, Badge, Fade, Button} from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { primaryColor } from '../../theme';

export interface TabOptionProps {
    title: string, 
    selected: boolean, 
    badgeContent?: number | string, 
    onClick: (value: any) => void,
    more: boolean,
    color?: string,
    style?: React.CSSProperties,
    variant?: string
}

const TabOption = (props: TabOptionProps) => {
    const {title, selected, badgeContent, onClick, more, color, style, variant} = props;

    let tabHeight = 55;
    let indicatorHeight = 5;
    if (variant === 'small') {
        tabHeight = 30;
        indicatorHeight = 2;
    }


    return (
        <Button onClick={onClick} style={{color: (selected ? (color ? color : primaryColor) : ''), height: tabHeight, textDecoration: 'none', textTransform: 'none', marginRight: 10, position: 'relative', ...style}} >
            <Badge badgeContent={badgeContent} color="error">
                <Typography>
                    {title} 
                </Typography>
                {more && <ArrowDropDown/>}
            </Badge>
            {
                selected &&
                <Fade in={true} timeout={300}>
                    <div style={{width: '100%', borderStartStartRadius: 25, borderStartEndRadius: 25, position: 'absolute', left: 0, bottom: 0, backgroundColor: (color ? color : primaryColor), height: indicatorHeight}}/>
                </Fade>
            }
        </Button>
    )
}

export default TabOption;