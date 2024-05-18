import axios from "axios";
import {baseURL} from './index';
import store from '../Store';

export const createActionFeature = async (parent, post, action) => {
    try {
        const response = await axios.post(
          baseURL + `spaces/${parent.space_id}/posts/${post.post_id}/action`,
          action,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
    
        return response.data;
      } catch (e) {
    
      }
} 

export const reorderActionFeature = async (parent, post, actions) => {
  try {
      const response = await axios.patch(
        baseURL + `spaces/${parent.space_id}/posts/${post.post_id}/action/reorder`,
        actions,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
} 


export const updateDateFeature = async (parent, post, event) => {
  try {
      const response = await axios.patch(
        baseURL + `spaces/${parent.space_id}/posts/${post.post_id}/event`,
        event,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
} 
