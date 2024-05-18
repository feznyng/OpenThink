import { Chip, ChipProps } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React, { CSSProperties, Fragment } from 'react';
import { useFragment } from 'react-relay';

interface UnreadChipProps {
    room: any,
    style?: CSSProperties
}

export default function UnreadChip({room, style, ...props}: UnreadChipProps & ChipProps) {
    const {currUser} = useFragment(
        graphql`
            fragment UnreadChipFragment on Room {
                currUser {
                    unreadNum
                }
            }
        `,
        room
    )
    

    return (
        <Fragment>
            {
                !!(currUser && currUser.unreadNum && currUser.unreadNum > 0) && 
                <Chip
                    size="small" 
                    {...props}
                    style={{...style, backgroundColor: '#F44336', color: 'white'}} 
                    label={currUser.unreadNum}
                />
            }
        </Fragment>
    )
}
