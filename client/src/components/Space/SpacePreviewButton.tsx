import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpaceIcon, { IconProps } from './SpaceIcon'
import { useHistory } from 'react-router';
import Button, { ButtonProps } from '../Shared/Button';
import { truncate as truncateString } from '../../utils/textprocessing';
import Typography from '../Shared/Typography';
import { TypographyProps } from '@material-ui/core';

export interface PreviewProps extends ButtonProps {
    onClick?: () => void,
    truncate?: boolean,
    titleProps?: Partial<TypographyProps>,
    iconProps?: Partial<IconProps>
}

interface SpacePreviewButtonProps extends PreviewProps {
    space: any,
}

export default function SpacePreviewButton({space, truncate, titleProps, iconProps, onClick, ...props}: SpacePreviewButtonProps) {
    const {spaceId, name, ...data} = useFragment(
        graphql`
            fragment SpacePreviewButtonFragment on Space {
                ...SpaceIconFragment
                spaceId
                name
                
            }
        `,
        space
    )

    let iconSize = 25;
    if (props.size === 'small') {
        iconSize = 20;
        titleProps = {...titleProps, variant: 'caption'}
    }

    return (
        <Button
            startIcon={
                <SpaceIcon
                    size={iconSize}
                    {...iconProps}
                    space={data}
                />
            }
            size="small"
            onClick={onClick}
            {...props}
        >
            <Typography {...titleProps}>{truncate ? truncateString(name, 15) : name}</Typography>
        </Button>
    )
}
