import { CircularProgress, IconButton, SwipeableDrawer } from '@material-ui/core'
import React, { useEffect } from 'react'
import { useQueryLoader } from 'react-relay'
import SuspenseLoader from '../Shared/SuspenseLoader'
import Sidebar from './Sidebar'
import SidebarQuery from './__generated__/SidebarQuery.graphql'
import { useAppSelector, useAppDispatch } from '../../Store'
import { toggleSidebar } from './NavSlice'
import { menuHeight } from './MainMenu'
import { Menu, MenuOpen } from '@material-ui/icons'

interface MainDrawerProps {
    drawerWidth?: number
}


export default function MainDrawer({drawerWidth}: MainDrawerProps) {
    const [
      sidebarQueryRef,
      loadSidebar
    ] = useQueryLoader(SidebarQuery)

    const open = useAppSelector(state => state.nav.sidebarOpen)

    const dispatch = useAppDispatch()

    const toggleDrawer = () => {
        dispatch(toggleSidebar())
    }

    useEffect(() => {
        if (!sidebarQueryRef) {
            loadSidebar({spaceCount: 5})
        }
    }, [open])

    const mobile = useAppSelector(state => state.uiActions.mobile)
    
    return (
        <SwipeableDrawer
            open={!!open}
            variant={mobile ? 'temporary' : "persistent"}
            onClose={toggleDrawer}
            onOpen={toggleDrawer}
            PaperProps={{
                style: {borderRadius: 0}
            }}
        >
            <SuspenseLoader queryRef={sidebarQueryRef} fallback={<CircularProgress/>}>
                <div style={{width: drawerWidth}}>
                    <Sidebar
                        queryRef={sidebarQueryRef}
                    />
                </div>
            </SuspenseLoader>
        </SwipeableDrawer>
    )
}
