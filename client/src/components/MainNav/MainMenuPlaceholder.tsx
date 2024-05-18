import React from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import {
  AppBar, 
  Zoom, 
  Fab, 
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Button, 
  IconButton, 
  Menu,
  Badge,
  MenuItem,
  Slide,
  Fade,
  Tooltip,
  Drawer,
  SwipeableDrawer,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Radio,
} from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import { 
  GroupOutlined,
  KeyboardArrowUp,
  AccountCircle,
  AccountCircleOutlined,
  Notifications,
  NotificationsNoneOutlined,
  Dashboard,
  DashboardOutlined,
  Chat,
  ChatBubbleOutline,
  Group,
  Menu as MenuIcon,
  Home,
  HomeOutlined,
  NotificationsOutlined,
  ArrowDownward,
  ArrowDropDown,
  ArrowLeft,
  ArrowBack,
  ChatBubble,
  Settings,
  ExitToApp,
  Help,
  Accessibility,
  CheckBox,
  ChevronRight,
  AspectRatio,
  Brightness2,
  MessageOutlined,
  MessageRounded,
} from '@material-ui/icons';
import {withStyles} from '@material-ui/styles'
import { Link, useLocation, useHistory } from "react-router-dom";
import store, { RootState } from '../../Store';
import { signOutCall } from '../../actions/userActions';
import { useDispatch } from "react-redux";
import { updateUser } from '../../actions/userActions';
import withWidth from '@material-ui/core/withWidth';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Searchbar from './SearchbarOld';
import {setDarkMode, setSidebar, setMenuHeight} from '../../actions/uiActions';
import { useSelector } from 'react-redux';
import { useLazyLoadQuery, useMutation, usePreloadedQuery } from 'react-relay';
import ScrollTop from './ScrollTop';
import { MainMenuPlaceholderQuery } from './__generated__/MainMenuPlaceholderQuery.graphql';
import { paperColor } from '../../theme';

const useStyles: any = makeStyles((theme: { breakpoints: { up: (arg0: string) => any; }; shape: { borderRadius: any; }; palette: { common: { white: string; }; }; spacing: (arg0: number) => any; transitions: { create: (arg0: string) => any; }; }) => ({
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    position: 'relative', 
    width: '100%',
    padding: 5
  },  
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  menuItems: {
    marginLeft:'3px',
    textTransform: 'none',
    display: 'none',
    fontSize: 12   + 'px',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  link: {
    textDecoration: 'none',
    marginLeft:'30px',
    "&:hover": {
      transform: 'scale(1.05)',
      textDecoration: 'none',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'flex',
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const options = [
  {
    link: '/',
    title: 'Home',
    InactiveIcon: HomeOutlined,
    ActiveIcon: Home,
    location: 'dashboard'
  },
  {
    link: '/spaces',
    title: 'Home',
    InactiveIcon: GroupOutlined,
    ActiveIcon: Group,
    location: 'spaces'
  },
  {
    link: '/messages',
    title: 'Home',
    InactiveIcon: ChatBubbleOutline,
    ActiveIcon: Chat,
    location: 'messages'
  },
  {
    link: '/notifications',
    title: 'Home',
    InactiveIcon: NotificationsOutlined,
    ActiveIcon: Notifications,
    location: 'notifications'
  },
  {
    title: 'Me',
    location: 'account',
  }
]

interface MainMenuProps {
  window?: any,
  width?: "sm" | "md" | "xs" | "lg" | 'xl'
}

function MainMenu({width, window}: MainMenuProps) {
  const classes = useStyles(undefined);
  const mobile = useSelector((state: RootState) => state.uiActions.mobile)
  const menuRef = React.useRef();
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (menuRef.current) {
      dispatch(setMenuHeight((menuRef.current as any).offsetHeight))
    }
  }, [menuRef])

  const small = (width === 'xs' || width === 'sm');
  
  const { me } = useLazyLoadQuery<MainMenuPlaceholderQuery>(
    graphql`
      query MainMenuPlaceholderQuery {
        me {
          darkMode
        }
      }
    `,
    {}
  )

  return (
    <div>
      <span id="back-to-top-anchor"></span>
      <AppBar ref={menuRef} style={{backgroundColor: 'transparent', padding: 0, boxShadow: 'none',  position: 'absolute'}}>
        <Toolbar className={classes.toolbar} style={{ backgroundColor: me?.darkMode ? paperColor : 'white', paddingLeft: 20, paddingRight: 20}} variant="dense">
            {
              mobile && 
              <IconButton>
                <MenuIcon/>
              </IconButton>
            }
          <Link to="/" style={{textDecoration: 'none'}}>
          <img
              alt=""
              style={{height: 40, cursor: 'pointer'}}
              src={`/assets/main/${'main_title'}.svg`}
          />
          </Link>
          {
            
            <div style={small ? {position: 'absolute', right: 15} : {}}>
              <Searchbar small={small}/>
            </div>
          }
          

          <div className={classes.grow}/>
          {
           !small &&
            <div className={classes.sectionDesktop}>
              {
                options.map(({title, link, location, ActiveIcon, InactiveIcon}) => (
                  <Tooltip
                    title={title}
                  >
                    <Button
                      style={{color: (''), textDecoration: 'none', textTransform: 'none', marginLeft: 10}} 
                    >
                      <div>
                        <Badge badgeContent={0} color="error">
                          <React.Fragment>
                            {
                              (ActiveIcon && InactiveIcon) &&
                              <React.Fragment>
                                <InactiveIcon style={{fontSize: 30}}/>
                              </React.Fragment>
                            }
                          </React.Fragment>
                        </Badge>
                      </div>
                    </Button>
                  </Tooltip>
                ))
              }
            </div>
          }
        </Toolbar>
      </AppBar>
      {
        small &&
        <div>
          <BottomNavigation
            value={0}
            onChange={(event, newValue) => {}}
            showLabels
            className={classes.root}
            style={{
              position: 'fixed',
              bottom: 0,
              width: '100%',
              zIndex: 300,
              backgroundColor: 'white'
            }}
          >
            <BottomNavigationAction label="Dashboard" icon={<Dashboard/>} />
            <BottomNavigationAction label="Groups" icon={<Group />} />
            <BottomNavigationAction label="Messages" icon={<Chat />} />
            <BottomNavigationAction label="Notifications" icon={<Notifications />} />
          </BottomNavigation>
        </div>
      }
      {
        !small &&
        <React.Fragment>
          <div color="primary" style={{position: 'fixed', bottom: 20, left: 20, zIndex: 1000}}>
            <ScrollTop window={window}>
              <Fab size="small" aria-label="scroll back to top">
                <KeyboardArrowUp/>
              </Fab>
            </ScrollTop>
          </div>
        </React.Fragment>
      }
    </div>
  );
}


export default withWidth()(MainMenu);