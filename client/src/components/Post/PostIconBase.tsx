import { getPostColor, getPostIcon } from '../../utils/postutils'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import React from 'react'
import { Avatar } from '@material-ui/core';
import { FiberManualRecord } from '@material-ui/icons';
import { IconProps } from '../Space/SpaceIcon';

export interface PostIconBaseProps extends IconProps {
    type: string,
    icon?: string,
    color?: string,
    useColor?: boolean,
    postColor?: string,
    completed?: boolean
}

export default function PostIconBase({type, icon, postColor, useColor, size, color, style, completed}: PostIconBaseProps) {

    const iconColor = color ? color : getPostColor(type)
    const IconElement: any = getPostIcon(type, {completed})

    return (
        <React.Fragment>
            {
                icon ? 
                <Avatar src={icon} style={{...style, width: size, height: size}}/>
                :
                <React.Fragment>
                    {   
                        postColor ? 
                        <FiberManualRecord style={{...style, fontSize: size, color: postColor}}/>
                        :
                        <IconElement style={{...style, fontSize: size, color: iconColor}}/>
                    }
                </React.Fragment>
            }
        </React.Fragment>
    )
}
