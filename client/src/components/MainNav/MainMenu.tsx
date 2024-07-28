import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Fab,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  IconButton,
  Menu,
  Badge,
  Fade,
  Tooltip,
  SwipeableDrawer,
  BadgeProps,
  CircularProgress,
} from "@material-ui/core";
import graphql from "babel-plugin-relay/macro";
import {
  KeyboardArrowUp,
  AccountCircle,
  Notifications,
  Chat,
  Menu as MenuIcon,
  Home,
} from "@material-ui/icons";
import { Link, useLocation, useHistory } from "react-router-dom";
import store, { RootState, useAppSelector } from "../../Store";
import { useDispatch } from "react-redux";
import withWidth from "@material-ui/core/withWidth";
import Searchbar from "../Search/Searchbar";
import { setMenuHeight } from "../../actions/uiActions";
import { useSelector } from "react-redux";
import UserIcon from "../User/UserIcon";
import { usePreloadedQuery, useQueryLoader } from "react-relay";
import ScrollTop from "./ScrollTop";
import ProfileOverlay from "./ProfileOverlay";
import { MainMenuQuery } from "./__generated__/MainMenuQuery.graphql";
import options from "./MainNavOptions";
import { Groups } from "@mui/icons-material";
import { toggleSidebar } from "./NavSlice";
import clsx from "clsx";
import { drawerWidth } from "../../App";
import { newNotificationSubscribe } from "../../subscriptions/NotificationsSubscription";
import MainSearch from "./MainSearch";
import { paperColor } from "../../theme";
export const menuHeight = 55;

const useStyles: any = makeStyles((theme: any) => ({
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    position: "relative",
    width: "100%",
    padding: 5,
  },
  menuItems: {
    marginLeft: "3px",
    textTransform: "none",
    display: "none",
    fontSize: 12 + "px",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  sectionDesktop: {
    display: "flex",
    marginBottom: -3,
  },
  appBar: {
    transition: theme.transitions.create(["padding", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["padding", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    paddingLeft: drawerWidth,
  },
}));

interface MainMenuProps {
  queryRef: any;
  window?: any;
  width?: "sm" | "md" | "xs" | "lg" | "xl";
}

let subscribed: any;

function MainMenu({ queryRef, width, window }: MainMenuProps) {
  const { me } = usePreloadedQuery<MainMenuQuery>(
    graphql`
      query MainMenuQuery {
        me {
          id
          userId
          firstname
          unreadMessages
          unreadMessagesNum
          notificationsNum(read: false)
          darkMode
          ...UserIconFragment
        }
      }
    `,
    queryRef,
  );

  React.useEffect(() => {
    subscribed?.dispose();
    if (me?.userId)
      subscribed = newNotificationSubscribe({ userId: me.userId }, "", me.id);
    return () => {
      subscribed?.dispose();
    };
  }, [me?.userId]);

  const darkMode = useAppSelector((state) => state.user.darkMode);
  const signedIn = useAppSelector((state) => state.user.signedIn);

  const history = useHistory();
  const location = useLocation();

  const dispatch = useDispatch();

  const classes = useStyles(undefined, signedIn);
  const menuRef = React.useRef();

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const [currLocation, setCurrLocation] = React.useState<string | null>(null);
  const [index, setIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (
      location.pathname.includes("/dashboard") ||
      location.pathname === "/" ||
      location.pathname === ""
    ) {
      setCurrLocation("dashboard");
      setIndex(0);
    } else if (location.pathname.includes("account")) {
      setCurrLocation("account");
      setIndex(-1);
    } else if (location.pathname.includes("notifications")) {
      setCurrLocation("notifications");
      setIndex(3);
    } else if (location.pathname.includes("space")) {
      setCurrLocation("spaces");
      setIndex(1);
    } else if (location.pathname.includes("signin")) {
      setCurrLocation("signin");
      setIndex(1);
    } else if (location.pathname.includes("signup")) {
      setCurrLocation("signup");
      setIndex(1);
    } else if (location.pathname.includes("messages")) {
      setCurrLocation("messages");
      setIndex(2);
    } else {
      setCurrLocation("dashboard");
      setIndex(0);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    if (menuRef.current) {
      dispatch(setMenuHeight((menuRef.current as any).offsetHeight));
    }
  }, [menuRef]);

  const mobile = useAppSelector((state) => state.uiActions.mobile);

  const sidebarOpen = useAppSelector((state) => state.nav.sidebarOpen);

  return (
    <div style={{ height: menuHeight }}>
      <span id="back-to-top-anchor"></span>
      <AppBar
        ref={menuRef}
        className={clsx(classes.appBar, {
          [classes.appBarShift]: sidebarOpen && !mobile,
        })}
        style={{
          backgroundColor: "transparent",
          padding: 0,
          position:
            !signedIn && currLocation === "dashboard" ? "absolute" : "fixed",
        }}
      >
        <Toolbar
          className={classes.toolbar}
          style={{
            backgroundColor: darkMode ? paperColor : "white",
            height: 55,
          }}
          variant="dense"
        >
          {me?.userId && (
            <IconButton onClick={() => dispatch(toggleSidebar())}>
              <MenuIcon />
            </IconButton>
          )}
          <Link to="/" style={{ textDecoration: "none" }}>
            <img
              alt=""
              style={{
                height: 40,
                cursor: "pointer",
                marginLeft: -10,
                marginBottom: -3,
              }}
              onClick={() => history.push("/")}
              src={`/assets/main/main_title.svg`}
            />
          </Link>
          <MainSearch style={{ marginLeft: 10 }} />
          <div className={classes.grow} />
          {signedIn && !mobile && (
            <div className={classes.sectionDesktop}>
              {options.map(
                ({ title, link, location, activeIcon, inactiveIcon }) => {
                  let badgeProps: BadgeProps = {
                    variant: "standard",
                    color: "error",
                    invisible: true,
                  };
                  if (location === "messages") {
                    badgeProps.invisible = !me?.unreadMessages;
                  } else if (location === "notifications") {
                    const numNotifications = me?.notificationsNum
                      ? me?.notificationsNum
                      : 0;
                    badgeProps.invisible = numNotifications === 0;
                    badgeProps.badgeContent = numNotifications;
                  }
                  return (
                    <Tooltip title={title} key={title}>
                      <Button
                        onClick={(e) => {
                          if (link) history.push(link);
                          else if (location === "account") {
                            setAnchorEl(e.currentTarget);
                          }
                        }}
                        style={{
                          color: currLocation === location ? "#2196f3" : "",
                          textDecoration: "none",
                          textTransform: "none",
                          marginLeft: 10,
                        }}
                      >
                        <div>
                          <Badge {...badgeProps}>
                            <React.Fragment>
                              {activeIcon && inactiveIcon ? (
                                <React.Fragment>
                                  {currLocation === location
                                    ? activeIcon
                                    : inactiveIcon}
                                </React.Fragment>
                              ) : (
                                <span>
                                  <UserIcon size={35} user={me} />
                                </span>
                              )}
                            </React.Fragment>
                          </Badge>
                        </div>
                        {currLocation === location && (
                          <Fade in={true} timeout={300}>
                            <div
                              style={{
                                width: "100%",
                                borderStartStartRadius: 25,
                                borderStartEndRadius: 25,
                                position: "absolute",
                                bottom: -2,
                                backgroundColor: "#2196f3",
                                height: 5,
                              }}
                            />
                          </Fade>
                        )}
                      </Button>
                    </Tooltip>
                  );
                },
              )}
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {anchorEl && (
                  <div style={{ width: 300 }}>
                    <ProfileOverlay onClose={() => setAnchorEl(null)} />
                  </div>
                )}
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      {signedIn && mobile && (
        <div>
          <BottomNavigation
            value={index}
            onChange={(event, newValue) => {
              setIndex(newValue);
            }}
            showLabels
            className={classes.root}
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              zIndex: 300,
              height: 40,
            }}
          >
            <BottomNavigationAction
              onClick={() => history.replace("/")}
              icon={<Home />}
            />
            <BottomNavigationAction
              onClick={() => history.replace("/spaces")}
              icon={<Groups />}
            />

            <BottomNavigationAction
              onClick={() => history.replace("/notifications")}
              icon={<Notifications />}
            />
          </BottomNavigation>
        </div>
      )}
      {!mobile && (
        <React.Fragment>
          <div
            color="primary"
            style={{ position: "fixed", bottom: 20, left: 20, zIndex: 1000 }}
          >
            <ScrollTop window={window}>
              <Fab size="small" aria-label="scroll back to top">
                <KeyboardArrowUp />
              </Fab>
            </ScrollTop>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default withWidth()(MainMenu);
