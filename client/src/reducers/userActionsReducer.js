import { 
  AWAITING_SIGN_IN, 
  SUCCESS_SIGN_IN, 
  ERROR_SIGN_IN,
  SIGN_OUT,
  AWAITING_GET_USER,
  SUCCESS_GET_USER,
  ERROR_GET_USER,
  AWAITING_GET_ACCOUNT,
  SUCCESS_GET_ACCOUNT,
  ERROR_GET_ACCOUNT,
  AWAITING_GET_NOTIFICATIONS,
  SUCCESS_GET_NOTIFICATIONS,
  ERROR_GET_NOTIFICATIONS,
  ERROR_DELETE_NOTIFICATIONS,
  SUCCESS_DELETE_NOTIFICATIONS,
  AWAITING_GET_FEED,
  SUCCESS_GET_FEED,
  ERROR_GET_FEED
} from '../actions/index';

const initalState = {
    loading: false,
    signedIn: false,
    jwt: '',
    userInfo: null,
    notifications: [],
    notificationsNum: 0,
    currUser: null,
    currUserPosts: [],
    currUserSpaces: [],
    tabs: [],
    messagesNum: 0,
  };
  
  const userActionsReducer = (state = initalState, action) => {
    const { type, payload } = action;
    let count = 0;

    switch (type) {
      case AWAITING_SIGN_IN:
        return {
          ...state,
          loading: true,
          signedIn: false
        }
      case ERROR_SIGN_IN:
        return {
          ...state,
          loading: false,
          signedIn: false
        }
      case SUCCESS_SIGN_IN:
        return {
          ...state,
          loading: false,
          signedIn: true,
          jwt: payload.jwt
        }
      case SIGN_OUT:
        return {
          loading: false,
          signedIn: false,
          jwt: '',
          userInfo: null,
          notifications: [],
          notificationsNum: 0,
          currUser: null,
        };
      case AWAITING_GET_USER:
        return {
          ...state,
          loading: false,
        }
      case SUCCESS_GET_USER:
        return {
          ...state,
          loading: false,
          userInfo: payload,
          jwt: payload.token,
        }
      case 'SET_USER_INFO':{
        return {
          ...state,
          loading: false,
          userInfo: payload,
          currUser: (payload.user_id === state.currUser.user_id) ? payload : state.currUser
        }
      }
      case ERROR_GET_USER:
        return {
          ...state,
          loading: true,
          
        }
      case 'CHANGE_MESSAGE_NUM':
        return {
          ...state,
          loading: true,
          messagesNum: payload,
        }
      case AWAITING_GET_NOTIFICATIONS:
        return {
          ...state,
          loading: true,
        }
      case SUCCESS_GET_NOTIFICATIONS:
        count = 0;
        payload.notifications.forEach(e => {
          if (!(e.read || e.original_post_deleted || e.project_post_deleted || e.space_post_deleted)) {
            count++;
          }
        });
        return {
          ...state,
          loading: false,
          notifications: payload.notifications,
          notificationsNum: count,
          messagesNum: 0,
        }
      case ERROR_GET_NOTIFICATIONS:
        return {
          ...state,
          loading: false,
          
        }
      case SUCCESS_DELETE_NOTIFICATIONS:
        return {
          ...state,
          loading: false,
          notifications: payload.notifications,
        }
      case ERROR_DELETE_NOTIFICATIONS:
        return {
          ...state,
          loading: false,
          
        }
        case AWAITING_GET_FEED:
        return {
          ...state,
          loading: true,
          
        }
      case SUCCESS_GET_FEED:
        return {
          ...state,
          loading: false,
        }
      case ERROR_GET_FEED:
        return {
          ...state,
          loading: false,
        }
      case 'SET_CURR_USER': {
        const currUser = payload;
        const tabs = [
          {
            title: 'Posts',
            link: '',
            default: true
          },
          
           {
            title: 'About',
            link: 'about',
          },
          {
            title: 'Connections',
            link: 'connections',
          },
          {
            title: 'Groups',
            link: 'groups',
          },
          {
            title: 'Projects',
            link: 'projects',
          },
          /*
          {
            title: 'Events',
            link: 'events',
          },
          {
            title: 'Questions',
            link: 'questions',
          },
          */
          
        ]
        /*
        if (currUser.user_id === state.userInfo.user_id) {
          tabs.push(
            {
              title: 'Tasks',
              link: 'tasks',
            },
          )
        }
        */
        return {
          ...state,
          currUser,
          tabs
        }
      }
      case 'SET_CURR_USER_POSTS': {
        const currUserPosts = payload;
        return {
          ...state,
          currUserPosts
        }
      }
      case 'SET_CURR_USER_SPACES': {
        const currUserSpaces = payload;
        return {
          ...state,
          currUserSpaces
        }
      }
      case 'LEAVE_SPACE': {
        const spaceID = payload;
        return {
          ...state,
          userInfo: {
            ...state.userInfo,
            spaces: state.userInfo.spaces.filter(s => s.space_id !== spaceID)
          },
          settingsOpen: false
        }
      }
      case 'JOIN_SPACE': {
        return {
          ...state,
          userInfo: {
            ...state.userInfo,
            spaces: [...state.userInfo.spaces, payload]
          },
          settingsOpen: false
        }
      }
      default:
        return state;
    }
  }
  
  export default userActionsReducer;