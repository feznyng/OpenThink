import axios from 'axios';
import { 
  baseURL
} from './index';
import store from '../Store';
import {getUserNotifications} from './userActions';


export const createNotification = async (userID, notification) => {
    try {
        const response = await axios.post(
          baseURL + `users/${userID}/notifications`,
          notification,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        );

        return response;
       
      } catch (e) {
       
      }
};
export const deleteUserNotification = (noteID) => async dispatch => {

  try {

    const response = await axios.delete(
      baseURL + `account/notification/${noteID}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );

    dispatch(getUserNotifications());
    
  } catch (e) {

  }
}
export const readUserNotifications = () => async dispatch => {

  try {
    if (store.getState().userActions.jwt === null) {
      return;
    }
    await axios.patch(
      baseURL + `account/notifications`,
      {},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );

    dispatch(getUserNotifications());
  } catch (e) {
   
  }
} 


export const deleteUserNotifications = () => async dispatch => {

  try {
    if (store.getState().userActions.jwt === null) {
      return;
    }
    await axios.delete(
      baseURL + `account/notifications`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );

    dispatch(getUserNotifications());
  } catch (e) {
   
  }
} 

export const readUserNotification = (id) => async dispatch => {
  try {
    if (store.getState().userActions.jwt === null) {
      return;
    }

    const response = await axios.patch(
      baseURL + `account/notification/${id}`,
      {},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );


    
    dispatch(getUserNotifications());
  } catch (e) {
   
  }
}


export const unreadUserNotification = (id) => async dispatch => {
  
  try {
    if (store.getState().userActions.jwt === null) {
      return;
    }

    const response = await axios.delete(
      baseURL + `account/notification/${id}/read`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );

    dispatch(getUserNotifications());
  } catch (e) {
   
  }
}