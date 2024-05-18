import axios from "axios";
import { 
  baseURL, 
  AWAITING_SIGN_IN, 
  SUCCESS_SIGN_IN, 
  ERROR_SIGN_IN, 
  SUCCESS_GET_USER, 
  ERROR_GET_USER, 
  AWAITING_GET_USER,
  AWAITING_GET_NOTIFICATIONS,
  ERROR_GET_NOTIFICATIONS,
  SUCCESS_GET_NOTIFICATIONS,
  SIGN_OUT,
} from './index';
import store from '../Store';
import { setupPersonalChannel } from './messageActions';
import fetchGraphQL from "../utils/graphqlutils";
export const signInCall = ({ email, password }) => async dispatch => {

  try {
    dispatch({
      type: AWAITING_SIGN_IN
    })
    const response = await axios.post(
      baseURL + 'login',
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    )
    dispatch({
      type: 'SUCCESS_SIGN_IN',
      payload: {
        jwt: response.data.token
      }
    });
    return response;
  } catch (e) {
    dispatch({
      type: ERROR_SIGN_IN,
    })
    return e;
  }
}


export const signUpCall = (user) => async dispatch => {

  try {
    dispatch({
      type: AWAITING_SIGN_IN
    })
    const response = await axios.post(
      baseURL + 'register',
      user,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    dispatch({
      type: SUCCESS_SIGN_IN,
      payload: {
        jwt: response.data.token
      }
    })
    return response;
  } catch (e) {
    dispatch({
      type: ERROR_SIGN_IN,
    });
    return e;
  }
}


export const updateUser = (user) => async dispatch => {
  try {
    const response = await axios.patch(
      baseURL + 'account',
      {...user, spaces: undefined, spacePosts: undefined, spaceComments: undefined},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    dispatch({
      type: 'SET_USER_INFO',
      payload: user
    })
  } catch (e) {
    console.log(e)
  }
}

export const updateDashboardList = async (list) => {

  try {
    const response = await axios.patch(
      baseURL + 'account/dashboard',
      list,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    return response.data;
  } catch (e) {
  }
}
export const getUserInfo = () => async dispatch => {
  try {
    dispatch({
      type: AWAITING_GET_USER
    })

    if (store.getState().userActions.jwt === null) {
      dispatch({
        type: ERROR_GET_USER,
      })
    }
    const response = await axios.get(
      baseURL + 'account',
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    ).catch(function (error) {
      if (error.response.status === 401) {
        dispatch({
          type: SIGN_OUT,
        });
      }
      throw error
      
    });
        
    dispatch({
      type: SUCCESS_GET_USER,
      payload: response.data
    });
    
    setupPersonalChannel(response.data.user_id);
    dispatch({
      type: 'SETTING_DARK_MODE',
      payload: !!response.data.dark_mode
    });
    return response.data;
  } catch (e) {
    console.log('error with user', e)
  }
}

export const getAccount = (id) => async dispatch => {
  try {
    const response = await axios.get(
      baseURL + `users/${id}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    return response.data;
  } catch (e) {
  }
}

export const getUserPage = (id) => async dispatch =>{
  try {
    const response = await axios.get(
      baseURL + `users/${id}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    return response.data;
  } catch (e) {
  }
}

export const getUserPagePosts = (id) => async dispatch =>{
  try {
    const response = await axios.get(
      baseURL + `users/${id}/posts`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    dispatch({
      type: 'SET_CURR_USER_POSTS',
      payload: response.data
    })
    return response.data;
  } catch (e) {
  }
}

export const getUserPageSpaces = (id) => async dispatch => {
  try {
    const response = await axios.get(
      baseURL + `users/${id}/spaces`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    dispatch({
      type: 'SET_CURR_USER_SPACES',
      payload: response.data
    })
    return response.data;
  } catch (e) {
  }
}

export const getUserByID = async (id) => { // non dispatch version
  try {
    const response = await axios.get(
      baseURL + `users/${id}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    return response.data;
  } catch (e) {
  }
}

export const getUserPostsByID = async (id) => { // non dispatch version
  try {
    const response = await axios.get(
      baseURL + `users/${id}/posts`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    return response.data;
  } catch (e) {
  }
}

export const getUserSpacesByID = async (id) => { // non dispatch version
  try {
    const response = await axios.get(
      baseURL + `users/${id}/spaces`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    return response.data;
  } catch (e) {
  }
}

export const getUserNotifications = () => async dispatch => {

  try {
    dispatch({
      type: AWAITING_GET_NOTIFICATIONS
    })

    if (store.getState().userActions.jwt === null) {
      dispatch({
        type: ERROR_GET_NOTIFICATIONS,
      })
    }
    const response = await axios.get(
      baseURL + 'account/notifications',
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );

    dispatch({
      type: SUCCESS_GET_NOTIFICATIONS,
      payload: {
        notifications: response.data
      }
    });

    return response.data;
  } catch (e) {
    dispatch({
      type: ERROR_GET_NOTIFICATIONS,
    })
  }
}

export const signOutCall = () => async dispatch => {
  dispatch({
    type: SIGN_OUT,
  });
}

export const getFeed = async (offset) => {
  try {
    const response = await axios.get(
      baseURL + `feed?offset=${offset ? offset: 0}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    )
    return response.data;
  } catch(e) {
  }
  
}

export const checkUserExists = (email) => async dispatch => {
  if (email === '') {
    return {message: false} 
  }
  try {
    const response = await axios.post(
      baseURL + 'users/check',
      {email: email},
      { headers: { 'Content-Type': 'application/json'} }
    )
    return response.data;
  } catch(e) {
  }
  
} 

export const getUsers = async () => {
  try {
    const response = await axios.get(
      baseURL + 'users',
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    )
    return response.data;
  } catch(e) {
  }
}

export const getProfilePosts = (user_id) => async dispatch => {
  try {
    const response = await axios.get(
      baseURL + `user/${user_id}/posts`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    dispatch({
      type: 'SET_VIEW_USER_POSTS',
      payload: response.data
    })
    return response.data;
  } catch(e) {
    console.error(e)
  }
}


export const getUserTasks = async (user_id, params) => {
  try {
    const response = await axios.get(
      baseURL + `user/${user_id}/tasks?${params}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch(e) {
    console.error(e)
  }
}
export const getUserEvents = async (user_id, params) => {
  try {
    const response = await axios.get(
      baseURL + `user/${user_id}/events?${params}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch(e) {
    console.log(e)
  }
}

export const getUserAttributes = async (user_id) => {
  try {
    const response = await axios.get(
      baseURL + `user/${user_id}/attributes`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    );
    return response.data;
  } catch(e) {
    console.error(e)
  }
}

export const initializeUser = () => dispatch => {
  dispatch({
    type: 'INITIALIZE_USERS',
  })
}