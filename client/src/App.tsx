import './App.css';
import { ThemeProvider } from '@material-ui/styles';
import MainMenu from './components/MainNav/MainMenu';
import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import { createTheme, withWidth, CssBaseline, Dialog, makeStyles } from '@material-ui/core';
import { connectSocket, disconnectSocket, useAppDispatch, useAppSelector } from './Store';
import { setupScreenListeners, setMobileLayout, setNav } from './actions/uiActions';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import Menu from './components/LandingPage/Menu';
import 'bootstrap/dist/css/bootstrap.min.css';
import { darkTheme, lightTheme } from './theme';
import MainMenuQuery from './components/MainNav/__generated__/MainMenuQuery.graphql';
import { environment } from './Store';
import { loadQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';
import MainMenuPlaceholder from './components/MainNav/MainMenuPlaceholder';
import { MAX_USER_SPACES } from './constants';
import graphql from 'babel-plugin-relay/macro';
import AppQuery, { AppQuery as AppQueryType } from './__generated__/AppQuery.graphql';
import MainDrawer from './components/MainNav/MainDrawer';
import clsx from 'clsx';
import { setDarkMode } from './utils/UserSlice';

const Router = lazy(() => import('./router/Router'));

export const drawerWidth = 300

const useStyles: any = makeStyles((theme: any) => ({
  content: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },
}))

interface AppProps {
  width: string,
  queryRef: any
}

function App({width, queryRef}: AppProps) {
  const {me} = usePreloadedQuery<AppQueryType>(
    graphql`
      query AppQuery {
        me {
          id
          userId
          darkMode
          productivityView
        }
      }
    `,
    queryRef
  )

  const mobile = useAppSelector((state) => state.uiActions.mobile)
  const nav = useAppSelector(state => state.uiActions.nav)
  const sidebarOpen = useAppSelector(state => state.nav.sidebarOpen)
  const dispatch = useAppDispatch()
  const bodyStyle = me?.productivityView ? {maxHeight: '100vh', overflow: 'auto'} : {height: '100%'}
  const signedIn = useAppSelector(state => state.user.signedIn)
  const classes = useStyles(undefined, signedIn);
  const darkMode = useAppSelector(state => state.user.darkMode)

  const [
    mainMenuQueryRef,
    loadMainMenuQuery
  ] = useQueryLoader(
      MainMenuQuery,
  );

  useEffect(() => {
    dispatch(setNav(true))
  }, [])
  
  useEffect(() => {
    if (signedIn) {
      dispatch(setupScreenListeners());
      connectSocket()
      loadMainMenuQuery({count: MAX_USER_SPACES}, {fetchPolicy: 'network-only'});
    } else {
      disconnectSocket()
    }
  }, [signedIn])

  useEffect(() => {
    dispatch(setMobileLayout(width))
  }, [width])

  useEffect(() => {
    if (me?.darkMode === null || !me?.userId) {
      dispatch(setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches))
    } else{
      dispatch(setDarkMode(me?.darkMode))
    }
  }, [me?.darkMode, me?.userId])

  const theme = React.useMemo(
    () => {      
      return createTheme((darkMode) ? darkTheme : lightTheme);
    },
    [darkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <div>
        {
          nav && !me?.productivityView && 
          <React.Fragment>
            {
              (signedIn && mainMenuQueryRef) ?
              <Suspense
                fallback={<MainMenuPlaceholder/>}
              >
                <MainMenu
                  queryRef={mainMenuQueryRef}
                />
              </Suspense>
              :
              <Fragment>
                <Menu/>
              </Fragment>
            }
          </React.Fragment>
        }
        {
          me?.userId && 
          <MainDrawer
            drawerWidth={drawerWidth}
          />
        }
        <div>
          {
            <div 
              style={{paddingBottom: mobile ? 45 : 0, width: '100%', height: '100%', ...bodyStyle}}
              className={clsx(classes.content, {
                [classes.contentShift]: (sidebarOpen && !mobile),
              })}
            >
              <ErrorBoundary>
                <Router/>
              </ErrorBoundary>
            </div>
          }
        </div>
      </div>
    </ThemeProvider>
  );
}

const AppWrapper = ({width}: any) => {
  const initialQueryRef = React.useMemo(() => loadQuery<AppQueryType>(  environment,  AppQuery,  {},), []) 
  return (
    <App width={width} queryRef={initialQueryRef}/>
  )
}


export default withWidth()(AppWrapper)