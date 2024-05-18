import { SwipeableDrawer } from '@material-ui/core'
import React, { useState } from 'react'
import ProfileOverlay from './ProfileOverlay'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import { SidebarQuery } from './__generated__/SidebarQuery.graphql';
import { useAppSelector } from '../../Store';
import SidebarSpaces from './SidebarSpaces';

interface SidebarProps {
    queryRef: any,
}

export default function Sidebar({queryRef}: SidebarProps) {
    const {me} = usePreloadedQuery<SidebarQuery>(
        graphql`
            query SidebarQuery($spaceCount: Int!, $groupCursor: String, $projectCursor: String, $favoriteCursor: String) {
                me {
                    userId
                    ...SidebarSpacesFragment
                }
            }
        `,
        queryRef
    )

    const [state, setState] = useState({
        open: false
    })

    const mobile = useAppSelector(state => state.uiActions.mobile)
    return (
        <div>
            {
                mobile && 
                <ProfileOverlay
                    onClose={() => setState({...state, open: false})}
                />
            }
            <SidebarSpaces
                user={me}
            />
        </div>
    )
}
