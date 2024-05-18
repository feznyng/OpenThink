import React, { Suspense, lazy, Fragment } from 'react'
import store, { useAppDispatch, useAppSelector } from '../Store';
import { useParams, useHistory, useLocation, Redirect } from "react-router-dom";
import {
  Switch,
  Route,
} from "react-router-dom";
import { CircularProgress } from '@material-ui/core';
import Dashboard from '../pages/Dashboard';
import SignUp from '../pages/SignUp.tsx';
import SignIn from '../pages/SignIn.tsx';
import withTracker from '../utils/withTracker';
import {useQueryLoader, usePreloadedQuery} from 'react-relay';
import ProfileQuery from '../pages/__generated__/ProfileQuery.graphql';
import MessagingQuery from '../pages/__generated__/MessagingQuery.graphql';
import SpaceViewQuery from '../pages/__generated__/SpaceViewQuery.graphql';
import TagPostsQuery from '../pages/__generated__/TagPostsQuery.graphql'
import DashboardQuery from '../pages/__generated__/DashboardQuery.graphql';
import NotificationsQuery from '../pages/__generated__/NotificationsQuery.graphql'
import SearchQuery from '../pages/__generated__/SearchQuery.graphql'
import SpacesQuery from '../pages/__generated__/SpacesQuery.graphql'
import WebViewEditor from '../pages/WebViewEditor';
import ProfileLoader from '../components/Profile/ProfileLoader';
import SuspenseLoader from '../components/Shared/SuspenseLoader';
import { queryString } from '../utils/urlutils';
import { setNav } from '../actions/uiActions';
import { setLastPage } from './RouterSlice';
import Search from '../pages/Search';
import OnboardingMenuQuery from '../pages/__generated__/OnboardingMenuQuery.graphql'
import InviteQuery from '../components/Link/__generated__/InviteQuery.graphql'
import Invite from '../components/Link/Invite';
import InvalidInvite from '../components/Link/InvalidInvite';

const LandingPage = withTracker(lazy(() => import('../pages/LandingPage')));
const Notifications = lazy(() => import('../pages/Notifications'));
const Messaging = withTracker(lazy(() => import('../pages/Messaging')));
const Profile = withTracker(lazy(() => import('../pages/Profile')));
const Account = lazy(() => import('../pages/Account'));
const Spaces = withTracker(lazy(() => import('../pages/Spaces')));
const SpaceView = withTracker(lazy(() => import('../pages/SpaceView')));
const ResourceForbidden = lazy(() => import('../pages/ResourceForbidden'));
const OnboardingMenu = lazy(() => import('../pages/OnboardingMenu'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Organizations = withTracker(lazy(() => import('../pages/Organizations')));
const About = withTracker(lazy(() => (import('../pages/About'))));
const Help = lazy(() => import('../pages/Help'));
const UserTasks = lazy(() => import('../pages/UserTasks'));
const UserEvents = lazy(() => import('../pages/UserEvents'));
const Settings = lazy(() => import('../pages/Settings'));
const TagPosts = lazy(() => import('../pages/TagPosts'));
const TrackedDashboard = withTracker(Dashboard);

export default function Router() {
  const [state, setState] = React.useState({
    page: '',
    id: ''
  });

  const location = useLocation();

  const signedIn = useAppSelector(state => state.user.signedIn)

  const [    
    messagesQueryRef,    
    loadMessagesQuery,  
  ] = useQueryLoader(    
      MessagingQuery,    
  );

  const [    
    profileQueryRef,    
    loadProfileQuery,  
  ] = useQueryLoader(    
      ProfileQuery,    
  );

  const [    
    spaceViewQueryRef,    
    loadSpaceViewQuery,  
  ] = useQueryLoader(    
      SpaceViewQuery,    
  );

  const [    
    tagPostQueryRef,    
    loadTagPostsQuery,  
  ] = useQueryLoader(    
    TagPostsQuery,    
  );

  const [    
    dashboardQueryRef,
    loadDashboard,
  ] = useQueryLoader(    
    DashboardQuery,    
  );

  const [    
    notificationsQueryRef,
    loadNotifications,
  ] = useQueryLoader(    
    NotificationsQuery,    
  );

  const [    
    searchQueryRef,
    loadSearch,
  ] = useQueryLoader(    
    SearchQuery,    
  );

  const [    
    onboardingQueryRef,
    loadOnboarding,
  ] = useQueryLoader(    
    OnboardingMenuQuery,    
  );

  const [    
    spacesQueryRef,
    loadSpaces,
  ] = useQueryLoader(    
    SpacesQuery,    
  );

  const [    
    inviteLinkQueryRef,
    loadInvite,
  ] = useQueryLoader(    
    InviteQuery,    
  )

  const dispatch = useAppDispatch()
  const history = useHistory()
  const splits = location.pathname.split("/");
  const page = splits[1];

  React.useEffect(() => {
   
    dispatch(setLastPage(location.pathname))

    if (page !== 'space')
      dispatch(setNav(true))

    switch(page) {
      case '': {
        signedIn && loadDashboard({feedCount: 20, taskCount: 0, tagCount: 5, reactionCount: 10, sortBy: 'New'})
        setState({...state, page})
        break;
      }
      case 'messages': {
        if (page !== state.page) {
          setState({...state, page})
          loadMessagesQuery({count: 100, dmCount: 0})
        }
        break;
      }
      case 'notifications': {
        if (page !== state.page) {
          setState({...state, page})
          loadNotifications({notificationCount: 10})
        }
        break;
      }
      case 'get-started': {
        if (page !== state.page) {
          setState({...state, page})
          loadOnboarding({spaceCount: 20,})
        }
        break;
      }
      case 'search': {
        const search = location.search
        const { query } = queryString.parse(search)

        if (page !== state.page) {
          setState({...state, page})
          loadSearch({query, groupCount: 10, projectCount: 10, userCount: 10, postCount: 5, tagCount: 5, reactionCount: 10})
        }
        break;
      }
      case 'space': {
        if ((page !== state.page || splits[2] !== state.id)) {
          loadSpaceViewQuery({id: parseInt(splits[2])})
          setState({...state, id: splits[2], page})
        }
        break;
      }
      case 'spaces': {
        if ((page !== state.page || splits[2] !== state.id)) {
          loadSpaces({myGroupCount: 100, myProjectCount: 100, groupCount: 100, projectCount: 100})
          setState({...state, id: splits[2], page})
        }
        break;
      }
      case 'profile': {
        if (page !== state.page) {
          loadProfileQuery({id: parseInt(splits[2])})
          setState({...state, page})
        }
        break;
      }
      case 'tags': {
        const {spaceId} = queryString.parse(location.search)
        if (page !== state.page) {
          loadTagPostsQuery({tag: splits[2], postCount: 20, tagCount: 30, reactionCount: 10, spaceId: spaceId ? parseInt(spaceId) : null, includeSpace: !!spaceId})
        }
        setState({...state, page})
        break;
      }
      case 'invite': {
        const key = location.pathname.split('/')[2]
        if (!signedIn) {
          history.replace(`/signin?key=${key}`)
          return
        }
        if (page !== state.page && key) {
          loadInvite({key})
        }
        break;
      }
    }
  }, [location.pathname])

  React.useEffect(() => {
    if (signedIn && page === '') {
      loadDashboard({feedCount: 20, taskCount: 0, tagCount: 5, reactionCount: 10, sortBy: 'New'}, {fetchPolicy: 'network-only'})
    }
  }, [signedIn])

  return (
    <Switch>
      <Suspense fallback={
        <div style={{width: '100vw', display: 'flex', justifyContent: 'center', marginTop: 100}}>
          <CircularProgress/>
        </div>
      }>
        <Route 
          path="/" 
          exact 
          render={(childProps) => (
            <Fragment>
              {
                (dashboardQueryRef && signedIn) ? 
                <Dashboard {...childProps} queryRef={dashboardQueryRef}/>
                :
                <LandingPage/>
              }
            </Fragment>
          )}
        />
        <Route path="/home" exact component={LandingPage}/>
        <Route path="/spaces/:spacePage?/:spaceId?" exact component={() => 
          <SuspenseLoader
            fallback={<ProfileLoader/>}
            queryRef={spacesQueryRef}
          >
            <Spaces queryRef={spacesQueryRef}/>
          </SuspenseLoader>
        }/>
        <Route path="/space/:spaceID/:spacePage?/:postID?/:subPage?/:viewId?" render={(childProps) => (
          <div>
            {
              spaceViewQueryRef && 
              <SpaceView {...childProps} queryRef={spaceViewQueryRef}/>
            }
          </div>
        )}/>
        <Route path="/notifications" render={(childProps) => (
          <SuspenseLoader queryRef={notificationsQueryRef} fallback={<div/>}>
            <Notifications queryRef={notificationsQueryRef}/>
          </SuspenseLoader>
        )}/>
        <Route path="/messages/:spaceID?/:roomID?" render={(childProps) => (
          <div>
            {
              messagesQueryRef && 
              <Messaging {...childProps} queryRef={messagesQueryRef}/>
            }
          </div>
        )}/>
        <Route path="/account/:userPage?" exact component={Account}/>
        <Route 
          path="/profile/:userID/:userPage?" 
          component={() => (<React.Fragment>{profileQueryRef ? <Profile queryRef={profileQueryRef}/> : <ProfileLoader/>}</React.Fragment>)}
        />
        <Route path="/signup" component={SignUp}>
          {signedIn ? <Redirect to="/" /> : <SignUp/>}
        </Route>
        <Route path="/signin" component={SignUp}>
          {signedIn ? <Redirect to="/" /> : <SignIn/>}
        </Route>
        <Route path="/not-found" component={NotFound}/>
        <Route path="/forbidden" exact component={ResourceForbidden}/>
        <Route path="/about" exact component={About}/>
        <Route path="/help" exact component={Help}/>
        <Route path="/organizations" exact component={Organizations}/>
        <Route path="/my-tasks" exact component={UserTasks}/>
        <Route path="/my-events" exact component={UserEvents}/>
        <Route path="/settings" exact component={Settings}/>
        <Route path="/get-started/:page?/:spaceId?" exact component={() => (
            <SuspenseLoader
              fallback={<ProfileLoader/>}
              queryRef={onboardingQueryRef}
            >
              <OnboardingMenu
                queryRef={onboardingQueryRef}
              />
            </SuspenseLoader>
          )}
        />
        <Route path="/web-view-editor" exact component={WebViewEditor}/>
        <Route path="/search/:type" exact component={() => (
            <SuspenseLoader
              fallback={<ProfileLoader/>}
              queryRef={searchQueryRef}
            >
              <Search
                queryRef={searchQueryRef}
              />
            </SuspenseLoader>
          )}
        />
        <Route 
          path="/tags/:tagId" 
          exact 
          component={() => (
            <SuspenseLoader
              fallback={<ProfileLoader/>}
              queryRef={tagPostQueryRef}
            >
              <TagPosts
                query={tagPostQueryRef}
              />
            </SuspenseLoader>
          )}
        />

        <Route path="/invite/:key" exact component={() => (
            <SuspenseLoader
              fallback={<ProfileLoader/>}
              queryRef={inviteLinkQueryRef}
            >
              <Invite
                queryRef={inviteLinkQueryRef}
              />
            </SuspenseLoader>
          )}
        />
        <Route path="/invite-invalid" exact component={() => (
            <InvalidInvite/>
          )}
        />
      </Suspense>
    </Switch>
  )
}
