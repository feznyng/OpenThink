import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import { Avatar, AvatarProps } from '@material-ui/core';
import { getImage } from '../../actions/S3Actions';
import { Group } from '@material-ui/icons'
import { projectTypes } from '../../utils/projectutils';
import { RocketLaunch } from '@mui/icons-material';

export interface IconProps {
    style?: React.CSSProperties,
    size?: number
}

export interface SpaceIconProps extends IconProps {
    space: any,
}

export default function SpaceIcon({space, style, size}: SpaceIconProps) {
    const {profilepic, project, projectType} = useFragment(
        graphql`
            fragment SpaceIconFragment on Space {
                profilepic
                project
                projectType
            }
        `,
        space
    )

    const commonStyle: AvatarProps = {
        style: {
            ...style,
            height: size, 
            width: size, 
            borderRadius: '20%'
        },
        variant: 'rounded'
    }

    if (profilepic && profilepic !== '') {
        return (
            <Avatar 
                src={getImage(profilepic)} 
                {...commonStyle}
            />
        )
    } else {
        let Icon: any = Group
        if (project) {
            Icon = RocketLaunch
            if (projectType) {
                Icon = projectTypes.find(({title}) => title === projectType)?.Icon
            }
            if (!Icon) {
                Icon = RocketLaunch
            }
        } else {
            Icon = Group
        }
        return (
            <Avatar 
                {...commonStyle}
            >
                <Icon
                    style={{
                        width: size ? size / 1.5 : undefined,
                        height: size ? size / 1.5 : undefined,
                    }}
                />
            </Avatar>
        )
    }
}
