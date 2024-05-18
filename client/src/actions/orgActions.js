import axios from "axios";
import { 
  baseURL, 
  AWAITING_GET_ORGANIZATIONS, 
  SUCCESS_GET_ORGANIZATIONS, 
  ERROR_GET_ORGANIZATIONS,
  AWAITING_GET_ORGANIZATION_BY_ID,
  SUCCESS_GET_ORGANIZATION_BY_ID,
  ERROR_GET_ORGANIZATION_BY_ID,
  PUSH_SPACE,
  POP_SPACE,
  CLEAR_SPACE,
  SET_ORIGIN,
  CLEAR_ORIGIN,
  SUCCESS_GET_USER
} from './index';

import store from '../Store'
import { deleteSpaceChannel, getSpaceChannel, setupSpaceChannel } from "./messageActions";
import commitCreateChannel from "../mutations/CreateChannel";
import { clientId } from "../Store";

export const getOrganizations = (limit) => async dispatch => {
    
}


export const getOrganizationbyID = (id) => async dispatch => {
  try {
    const response = await axios.get(
      baseURL + `spaces/${id}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    )
    dispatch({
      type: SUCCESS_GET_ORGANIZATION_BY_ID,
      payload: {currSpace: response.data, currUser: response.data.space_user ? response.data.space_user : store.getState().userActions.userInfo}
    });
    return response.data;
  } catch (e) {
    console.log('get space error', e)
  }
}

export const createSpace = (space, root) => async dispatch => {
  try {
    const response = await axios.post(
      baseURL + `spaces`,
      space,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    const newSpace = {...space, space_id: response.data.space_id, accepted: true, type: 'Creator'}
    dispatch({
      type: SUCCESS_GET_USER,
      payload: {
        ...store.getState().userActions.userInfo,
        spaces: [
          ...store.getState().userActions.userInfo.spaces,
          newSpace
        ]
      },
    });

    commitCreateChannel({
      variables: {
          input: {
              spaceId: response.data.space_id,
              name: 'general', 
              type: 'text',
              visibility: 'internal',
              clientId,
              index: 0
          },
          connections: []
      }
    })

    setupSpaceChannel(newSpace.space_id)

    return newSpace;
    
  } catch (e) {
    
  }
}

export const pushSpace = (space) => async dispatch => {
  dispatch({
    type: PUSH_SPACE,
    payload: space,
  })
}


export const popSpace = () => async dispatch => {
  dispatch({
    type: POP_SPACE,
  })
}

export const clearSpace = (url) => async dispatch => {
  dispatch({
    type: CLEAR_SPACE,
    payload: url,
  })
}

export const setOrigin = (url) => async dispatch => {
  dispatch({
    type: SET_ORIGIN,
    payload: url,
  })
}

export const clearOrigin = () => async dispatch => {
  dispatch({
    type: CLEAR_ORIGIN,
  })
}

export const createSpaceUser = (spaceID, users, space) => async dispatch => {
  try {
    const response = await axios.post(
      baseURL + `spaces/${spaceID}/users${users.length > 1 ? '/multiple' : ''}`,
      {users},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    const currUser = users.find(u => u.user_id === store.getState().userActions.userInfo.user_id)

    if (space) {
      dispatch({
        type: 'JOIN_SPACE',
        payload: {...space, ...currUser, ...response.data}
      });

      setupSpaceChannel(spaceID);
    }

    return response.data;
  } catch (e) {

  }
}

export const updateSpaceUser = (spaceID, user) => async dispatch => {
  
  try {
    const response = await axios.patch(
      baseURL + `spaces/${spaceID}/users/${user.space_user_id}`,
      user,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    if (user.user_id === store.getState().userActions.userInfo.user_id) {
      dispatch({
        type: 'UPDATE_CURR_USER',
        payload: user
      })
    } else {
      dispatch({
        type: 'UPDATE_SPACE_USER',
        payload: user
      })
    }
    
   
    return response.data;
  } catch (e) {

  }
}

export const deleteSpaceUser = (spaceID, user) => async dispatch => {
  
  try {
    const response = await axios.delete(
      baseURL + `spaces/${spaceID}/users/${user.space_user_id}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    deleteSpaceChannel(spaceID)

    if (store.getState().userActions.userInfo.user_id === user.user_id) {
      dispatch({
        type: 'LEAVE_SPACE',
        payload: spaceID
      })
    } else {
      dispatch({
        type: 'DELETE_SPACE_USER',
        payload: user
      })
    }
    

    return response.data;
  } catch (e) {
    console.error(e);
  }
}

export const updateSpace = (space) => async dispatch => {
  try {
    const response = await axios.patch(
      baseURL + `spaces/${space.space_id}`,
      {...space, users: undefined, posts: undefined, relations: undefined, subspaces: undefined, access_questions: space.access_questions ? space.access_questions.slice(0, space.access_questions.length - 1) : []},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: 'UPDATE_SPACE',
      payload: space
    })
    return response.data;
  } catch (e) {
    console.error(e);
  }
}


export const updateSpaceWiki = (spaceID, wiki) => async dispatch => {
  try {
    await axios.patch(
      baseURL + `spaces/${spaceID}/wiki`,
      wiki,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: "SET_SPACE_WIKI",
      payload: wiki
    })
  } catch (e) {

  }
}

export const getSpaceWiki = (spaceID) => async dispatch => {
  try {
    const response = await axios.get(
      baseURL + `spaces/${spaceID}/wiki`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: "SET_SPACE_WIKI",
      payload: response.data
    })
    return response.data;
  } catch (e) {

  }
}



export const getParentUsers = async (parentID) => {
  
  try {
    const response = await axios.get(
      baseURL + `spaces/${parentID}/users`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const generateSpaceLink = async (space_id) => {
  try {
    const response = await axios.post(
      baseURL + `invite/link`,
      {space_id},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const getSpaceLink = async (space_id) => {
  try {
    const response = await axios.get(
      baseURL + `spaces/${space_id}/invite/link`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const finishSpaceLink = async (url) => {
  try {
    const response = await axios.get(
      baseURL + `invite/link/${url}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const deleteParent = async (parentID, parentType) => {
  try {
    const response = await axios.delete(
      baseURL + `${parentType}/${parentID}/permanent`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}


export const getParentPosts = async (parent, query) => {
    let queryString = '';
    if (query) {
      Object.entries(query).forEach(q => {
        queryString += `${q[0]}=${q[1]}&`
      })
    }
  try {
    const response = await axios.get(
      baseURL + `spaces/${parent.space_id}/posts?${queryString}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const getSpacePosts = (parent) => async dispatch => {
  

  try {

    const response = await axios.get(
      baseURL + `spaces/${parent.space_id}/posts`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: 'SET_CURR_SPACE_POSTS',
      payload: response.data
    })
    return response.data;
  } catch (e) {
    
  }
}

export const setGroupPage = (page) => dispatch => {
  dispatch({
    type: 'SET_SPACE_PAGE',
    payload: page
  })
}

export const setGroupSettingsPage = (page) => dispatch => {
  dispatch({
    type: 'SET_SPACE_SETTINGS_PAGE',
    payload: page
  })
}

export const setGroupInfoPage = (page) => dispatch => {
  dispatch({
    type: 'SET_SPACE_INFO_PAGE',
    payload: page
  })
}


export const toggleGroupSettings = (settings) => dispatch => {
  dispatch({
    type: 'TOGGLE_GROUP_SETTINGS',
    payload: settings
  })
}

export const toggleMessages = (settings) => dispatch => {
  dispatch({
    type: 'TOGGLE_MESSAGES',
    payload: settings
  })
}

export const setGeneralSettings = (editedSpace, spaceEdited) => dispatch => {
  dispatch({
    type: 'SET_GENERAL_SETTINGS',
    payload: {editedSpace, spaceEdited}
  })
}

export const setPersonalSettings = (editedSpaceUser, spaceUserEdited) => dispatch => {
  dispatch({
    type: 'SET_PERSONAL_SETTINGS',
    payload: {editedSpaceUser, spaceUserEdited}
  })
}

export const resetSpace = () => dispatch => {
  dispatch({
    type: 'RESET_SPACE',
  })
}