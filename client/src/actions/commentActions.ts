import axios from "axios";
import {baseURL} from './index';
import store from '../Store';
import { space } from "../types/space";
import {post, comment, vote} from "../types/post";


export const getComments = async (parent: space, post: post) => {
  try {
    const response = await axios.get(
      baseURL + `spaces/${parent.space_id}/posts/${post.original_post_id}/comments`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    return response.data;
  } catch (e) {

  }
}


export const createComment = async (parentType: string, id: number, postID: number, comment: comment) => {
  
    try {
      const response = await axios.post(
        baseURL + `spaces/${id}/posts/${postID}/comments`,
        comment,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
      return response.data;
    } catch (e) {
  
    }
}
  


export const updateComment = async (parentType: string, commentID: number, comment: comment) => {
  
  try {
    const response = await axios.patch(
      baseURL + `spaces/comments/${commentID}`,
      comment,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    return response.data;
  } catch (e) {

  }
}

export const deleteComment = async (parentType: string, comment: comment) => {
  if (!comment.children || comment.children.length === 0) {
    try {
      const response = await axios.delete(
        baseURL + `spaces/comments/${comment.commentID}/permanent`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
      return response.data;
    } catch (e) {
  
    }
  } else {
    try {
      const response = await axios.delete(
        baseURL + `spaces/comments/${comment.commentID}`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
      return response.data;
    } catch (e) {
  
    }
  }
  
}


export const voteComment = async(parentType: string, commentID: number, vote: vote) => {
  try {
    const response = await axios.post(
      baseURL + `spaces/comments/${commentID}/vote`,
      vote,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    return response.data;
  } catch (e) {

  }
}


export const deleteCommentVote = async(parentType: string, commentID: number) => {
  try {
    const response = await axios.delete(
      baseURL + `spaces/comments/${commentID}/vote`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    return response.data;
  } catch (e) {

  }
}
