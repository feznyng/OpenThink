import { Drawer, Paper, SwipeableDrawer } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { Collapse } from '@mui/material'
import React, { ReactElement } from 'react'
import clsx from 'clsx';
import { useAppSelector } from '../../Store';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const drawerWidth = 600

const useStyles = makeStyles((theme: any) => ({
    content: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: 0
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: drawerWidth,
    },
}))

interface DrawerViewProps {
    open: boolean
    drawerWidth?: number,
    children?: any,
    sidebar: ReactElement,
}

export default function DrawerView({open, drawerWidth = 400, sidebar, children}: DrawerViewProps) { 
    const { width } = useWindowDimensions()
    const classes = useStyles()

    return (
        <div style={{display: 'flex', height: '100%', maxHeight: '100%', position: 'relative'}}>
            <div>
                {children}
            </div>
            <Collapse orientation='horizontal' in={open} style={{zIndex: 100, position: 'absolute', right: 0, height: '100%', maxHeight: '100%', overflow: 'auto'}}>
                <Paper style={{maxWidth: drawerWidth, width: '100%', }}>
                    {sidebar}
                </Paper>
            </Collapse>
        </div>
    )
}
