import { Divider, Drawer, IconButton, ListItemIcon, ListItemText, makeStyles, useTheme } from '@material-ui/core';
import React, { CSSProperties, ReactElement, Suspense, useEffect } from 'react'
import clsx from 'clsx';
import graphql from 'babel-plugin-relay/macro';
import { Dashboard, Menu, People, Settings } from '@material-ui/icons';
import { darkBorderStyle, lightBorderStyle } from '../../pages/Messaging';
import { useFragment, useQueryLoader } from 'react-relay';
import ProjectSelector from './ProjectSelector';
import ProjectSelectorQuery from './__generated__/ProjectSelectorQuery.graphql'
import SuspenseLoader from '../Shared/SuspenseLoader';
import ProfileLoader from '../Profile/ProfileLoader';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useAppSelector } from '../../Store';
import ListItem from '../Shared/ListItem';
import { useHistory, useLocation, useParams } from 'react-router';
import Dialog from '../Shared/Dialog';
import { SpaceViewParams } from '../../types/router';
import InviteButton from '../Space/InviteButton'

export const drawerWidth = 240;
const postViewWidth = 240;
export const menuHeight = 60;
const defaultPages = [
  {
    name: 'Overview',
    icon: <Dashboard/>,
    link: 'overview'
  },
  {
    name: 'Settings',
    icon: <Settings/>,
    link: 'settings'
  },
  {
    name: 'People',
    icon: <People/>,
    link: 'people'
  },
]

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    borderRadius: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    marginRight: 0
  },
  contentRightShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: postViewWidth,
  },
  header: {
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    paddingLeft: 0,
    paddingRight: 0,
  },
  headerShift: {
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    paddingLeft: drawerWidth
  },
  headerRightShift: {
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    paddingRight: drawerWidth
  },
}));

interface ProjectViewProps {
    sidebar: ReactElement,
    header?: ReactElement,
    postView?: ReactElement,
    content: ReactElement,
    style?: CSSProperties,
    sidebarOpen: boolean,
    postViewOpen?: boolean,
    toggleSidebar: () => void,
    project: any,
    closeSettings: () => void,
}

export default function ProjectView({sidebarOpen, closeSettings, project, postViewOpen, toggleSidebar, header, postView, sidebar, content}: ProjectViewProps) {
  const space = useFragment(
    graphql`
      fragment ProjectViewFragment on Space {
        spaceId
        parentSpaceId
        ...InviteButtonFragment_space
        permissions {
          canInvite
        }
      }
    `,
    project
  )


  const { spaceId, parentSpaceId } = space
  const classes = useStyles();
  const { palette } = useTheme()
  const darkMode = palette.type === 'dark'
  const { height, width } = useWindowDimensions()
  const mobile = useAppSelector(state => state.uiActions.mobile)
  const { canInvite } = space!!.permissions!!
  
  const [
    selectorQueryRef,
    loadSelectorQuery
  ] = useQueryLoader(ProjectSelectorQuery)

  useEffect(() => {
    loadSelectorQuery({spaceId, parentSpaceId, inGroup: !!parentSpaceId, spaceCount: 20})
  }, [parentSpaceId])

  const {spacePage} = useParams<SpaceViewParams>()

  return (
      <div className={classes.root}>
          <Drawer
              className={classes.drawer}
              variant={mobile ? 'temporary' : "persistent"}
              anchor="left"
              open={sidebarOpen}
              classes={{
                  paper: classes.drawerPaper,
              }}
              onClose={toggleSidebar}
          >
            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
              <div>
                <div>
                  <SuspenseLoader
                    queryRef={selectorQueryRef}
                    fallback={<ProfileLoader/>}
                  >
                    <ProjectSelector
                      queryRef={selectorQueryRef}
                      style={{padding: 5}}
                    />
                  </SuspenseLoader>
                </div>
                {sidebar}
              </div>
            </div>
          </Drawer>
          <div 
              style={{position: 'fixed', top: 0, left: 0, borderBottom: 'solid', ...(darkMode ? darkBorderStyle : lightBorderStyle), width: '100%', display: 'flex', alignItems: 'center', height: menuHeight, zIndex: 1000}}
              className={clsx(classes.header, {
                  [classes.headerShift]: sidebarOpen,
              })}
          >
              <IconButton
                  onClick={toggleSidebar}
                  size='small'
                  style={{marginLeft: 5, marginRight: 5}}
              >
                  <Menu/>
              </IconButton>
              {header}
              <div style={{float: 'right', paddingRight: 15}}>
                {
                  canInvite && 
                  <Suspense fallback={<div/>}>
                    <InviteButton
                      space={space}
                      size="small"
                    />
                  </Suspense>
                }
              </div>
          </div>
          <main
              className={mobile ? '' : clsx(classes.content, {
                [classes.contentShift]: sidebarOpen,
              })}
              style={{position: 'relative', height: height - menuHeight, marginTop: menuHeight, width: width - (sidebarOpen ? drawerWidth : 0) + 20}}
          >
            {content}
          </main>
      </div>
  )
}
