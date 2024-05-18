import axios from "axios";
import {baseURL} from './index';
import store from '../Store';

export const addPostUsers = async (parent, post, users) => {
    try {
      const response = await axios.post(
        baseURL + `posts/${post.original_post_id}/users`,
        users,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
}

export const addPostUser = async (parent, post, user) => {
  try {
    const response = await axios.post(
      baseURL + `posts/${post.original_post_id}/users`,
      user,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const deletePostUser = async (parent, post, user) => {
  try {
    const response = await axios.delete(
      baseURL + `posts/${post.original_post_id}/users/${user.user_id}/${user.type}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const deletePostUsers = async (parent, post) => {
  try {
    const response = await axios.delete(
      baseURL + `posts/${post.original_post_id}/users`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}