import { makeStyles, Menu, Popover } from '@material-ui/core';
import React, { Suspense } from 'react'
import { useFragment, useQueryLoader } from 'react-relay';
import PreviewCardWrapper, { PreviewCardWrapperProps } from '../Shared/PreviewCardWrapper';
import Typography from '../Shared/Typography';
import SpacePreviewCard from './SpacePreviewCard';
import graphql from 'babel-plugin-relay/macro';


interface SpacePreviewCardWrapperProps {
    space: any,
    children: React.ReactElement | React.ReactElement[],
    variant?: 'hover' | 'click'
}


export default function SpacePreviewCardWrapper({children, space, variant, ...props}: SpacePreviewCardWrapperProps & Partial<PreviewCardWrapperProps>) {
    const {spaceId} = useFragment(
        graphql`
            fragment SpacePreviewCardWrapperFragment on Space {
                spaceId
            }
        `,
        space
    )

    return (
        <PreviewCardWrapper
            {...props}
            previewCard={
                <SpacePreviewCard
                    spaceId={spaceId}
                />
            }
            fallback={<div/>}
            variant={variant}
        >
            {children}
        </PreviewCardWrapper>
    )
}
