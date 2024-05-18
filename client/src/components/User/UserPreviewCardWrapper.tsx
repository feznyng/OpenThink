import { makeStyles, Menu, Popover, PopoverProps } from '@material-ui/core';
import React, { Suspense } from 'react'
import { useFragment, useQueryLoader } from 'react-relay';
import PreviewCardWrapper, { PreviewCardWrapperProps } from '../Shared/PreviewCardWrapper';
import Typography from '../Shared/Typography';
import UserPreviewCard from './UserPreviewCard';
import graphql from 'babel-plugin-relay/macro';


interface UserPreviewCardWrapperProps {
    user: any,
    children: React.ReactElement | React.ReactElement[],
    variant?: 'hover' | 'click'
}


export default function UserPreviewCardWrapper({children, user, variant, ...props}: UserPreviewCardWrapperProps & Partial<PreviewCardWrapperProps>) {
    const {userId} = useFragment(
        graphql`
            fragment UserPreviewCardWrapperFragment on User {
                userId
            }
        `,
        user
    )

    return (
        <PreviewCardWrapper
            {...props}
            previewCard={
                <UserPreviewCard
                    userId={userId}
                />
            }
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            fallback={<div/>}
            variant={variant}
        >
            {children}
        </PreviewCardWrapper>
    )
}
