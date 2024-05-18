import axios from "axios";
import { 
  baseURL, 
  AWAITING_GET_POSTS, 
  SUCCESS_GET_POSTS, 
  ERROR_GET_POSTS,

  AWAITING_UPDATE_POST, 
  SUCCESS_UPDATE_POST, 
  ERROR_UPDATE_POST,

  AWAITING_GET_POST_BY_ID, 
  SUCCESS_GET_POST_BY_ID, 
  ERROR_GET_POST_BY_ID,

  AWAITING_GET_POSTS_RELATIONS, 
  SUCCESS_GET_POSTS_RELATIONS, 
  ERROR_GET_POSTS_RELATIONS,

  SUCCESS_UPVOTE_POSTS,
  ERROR_UPVOTE_POSTS,

  CLEAR_POST_STACK,
  POP_POST_STACK,
  PUSH_POST_STACK,

  SUCCESS_FOLLOW_POST,
  ERROR_FOLLOW_POST,
  
  AWAITING_DELETE_POST, 
  SUCCESS_DELETE_POST, 
  ERROR_DELETE_POST,
} from './index';

import store from '../Store'
export const getPosts = (start, end) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_GET_POSTS
    })
    const response = await axios.get(
      baseURL + `posts/get/${end}`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    dispatch({
      type: SUCCESS_GET_POSTS,
      payload: {
        allPosts: response.data
      }
    })
  } catch (e) {
    dispatch({
      type: ERROR_GET_POSTS,
    })
  }
}

export const getposts = (parentType, projectID, postID, query) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_GET_POSTS
    })
    let queryString = '';
    if (query) {
      Object.entries(query).forEach(q => {
        queryString += `${q[0]}=${q[1]}&`
      })
    }
    const response = await axios.get(
      baseURL + `spaces/${projectID}/posts/${postID}/relations?${queryString}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    )
    dispatch({
      type: SUCCESS_GET_POSTS,
      payload: {
        allPosts: response.data
      }
    });
    return response.data;
  } catch (e) {
    dispatch({
      type: ERROR_GET_POSTS,
    })
  }
}


export const getPostByID = (parent, parentID, id) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_GET_POST_BY_ID
    })
    const response = await axios.get(
      baseURL + `${parent}/${parentID}/posts/${id}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}

    )
    dispatch({
      type: SUCCESS_GET_POST_BY_ID,
      payload: {
        currPost: response.data
      }
    });
    return response.data;
  } catch (e) {
    dispatch({
      type: ERROR_GET_POST_BY_ID,
    })
  }
}

export const getSpacePostByID = async (parent, parentID, id) => {
  try {
    const response = await axios.get(
      baseURL + `spaces/${parentID}/posts/${id}`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}

    )
    return response.data;
  } catch (e) {
    
  }
}

export const makePost = async (post) => {
  try {
    if (!post.info) {
      post.info = {};
    }
    if (!post.tags) {
      post.tags = [];
    }
    let response = await axios.post(
      baseURL + `posts`,
      {...post, spaces: undefined},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    
    return response.data;
    
    
  } catch (e) {
    
  }
}

export const makeParentPost = async (parentType, parentID, val) => {
  const response = await axios.post(
    baseURL + `spaces/${parentID}/posts`,
    val,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
  );
  return response.data;
}


export const changePostParents = async (post_id, spaces) => {
  const response = await axios.patch(
    baseURL + `posts/${post_id}/spaces`,
    spaces,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
  );

  return response.data;
}

export const getPostParents = async (post_id) => {
  const response = await axios.get(
    baseURL + `posts/${post_id}/spaces`,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
  );

  return response.data;
}

export const makeRelatedPost = async (parentType, parentID, postID, post_id) => {
  try {
    const response = await axios.post(
      baseURL + `spaces/${parentID}/posts/${postID}/posts`,
      {post_id},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );

    return response.data;
  } catch (e) {
    
  }
}

export const makeRelation = (parentType, parentID, postID, post2ID) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_UPDATE_POST
    })
    const response = await axios.post(
      baseURL + `spaces/${parentID}/posts/${postID}/relations`,
      {post: post2ID},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: SUCCESS_UPDATE_POST,
      payload: {
        currPost: response.data
      }
    })
  } catch (e) {
    dispatch({
      type: ERROR_UPDATE_POST,
    })
  }
}


export const deleteRelation = (parentType, relationID) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_UPDATE_POST
    })
    const response = await axios.delete(
      baseURL + `spaces/relations/${relationID}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: SUCCESS_UPDATE_POST,
      payload: {
        currPost: response.data
      }
    })
  } catch (e) {
    dispatch({
      type: ERROR_UPDATE_POST,
    })
  }
}


export const updatePost = (post) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_UPDATE_POST
    })
    if (!post.info) {
      post.info = {};
    }
    const response = await axios.patch(
      baseURL + `posts/${post.post_id}`,
      post,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    dispatch({
      type: SUCCESS_UPDATE_POST,
      payload: {
        currPost: response.data
      }
    })
  } catch (e) {
    dispatch({
      type: ERROR_UPDATE_POST,
    })
  }
}

export const deletePost = (parent, post) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_DELETE_POST
    })
    let response;

    let deletePost = false;
    let spaces = await getPostParents(post.original_post_id);
    if (post.relationcount < 1) {
      deletePost = true;
      for (let i = 0; i < spaces.length; i++) {
        const space = spaces[i];
        if ((space.space_id && space.space_id === parent.space_id)) {
          continue;
        }
        if (space.relationcount > 0) {
          deletePost = false;
          break;
        }
      }
    }

    if (deletePost) {
      response = await axios.delete(
        baseURL + `posts/${post.original_post_id}/permanent`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      );
    } else {
      response = await axios.delete(
        baseURL + `posts/${post.original_post_id}`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      );
    }
    
    
    dispatch({
      type: SUCCESS_DELETE_POST,
      payload: {
        currPost: response.data
      }
    });
    return response.data;
  } catch (e) {
    dispatch({
      type: ERROR_DELETE_POST,
    })
  }
};

export const removePost = (parent, post) => async dispatch => {
  try {
    dispatch({
      type: AWAITING_DELETE_POST
    })
    let response;
    let permanent = false;
    let deletePost = false;
    let spaces = [];
    if (post.spaces) {
      if (typeof(post.spaces) === 'string') {
        spaces = JSON.parse(post.spaces);
      } 
    }
    if (post.relationcount < 1) {
      permanent = true;
      deletePost = true;
      for (let i = 0; i < spaces.length; i++) {
        const space = spaces[i];
        if (!space) {
          continue;
        }
        if (space.space_id && space.space_id === parent.space_id) {
          continue;
        }
        if (!space.deleted) {
          deletePost = false;
          break;
        }
      }
    }

    if (deletePost) {
      response = await axios.delete(
        baseURL + `posts/${post.original_post_id}/permanent`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
    } else if (permanent) {
      response = await axios.delete(
        baseURL + `spaces/${parent.space_id}/posts/${post.post_id}/perm`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
    } else {
      response = await axios.delete(
        baseURL + `spaces/${parent.space_id}/posts/${post.post_id}`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
    }
    dispatch({
      type: SUCCESS_DELETE_POST,
      payload: {
        currPost: response.data
      }
    });
    return response.data;
  } catch (e) {
    
  }
};

export const votePost = (parentType, id, parentID) => async dispatch => {
  try {
    await axios.post(
      baseURL + `spaces/${parentID}/posts/${id}/vote`,
      {voteType: true},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    dispatch({
      type: SUCCESS_UPVOTE_POSTS,
    })
  } catch (e) {
    dispatch({
      type: ERROR_UPVOTE_POSTS,
    })
  }
}

export const removeVotePost = (parentType, id, parentID) => async dispatch => {
  try {
    await axios.delete(
      baseURL + `spaces/${parentID}/posts/${id}/vote`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    dispatch({
      type: SUCCESS_UPVOTE_POSTS,
    })
  } catch (e) {
    dispatch({
      type: ERROR_UPVOTE_POSTS,
    })
  }
}


export const followPost = (parentType, id, followObject) => async dispatch => {
  try {
    await axios.post(
      baseURL + `posts/${id}/follow`,
      followObject,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    dispatch({
      type: SUCCESS_FOLLOW_POST,
    })
  } catch (e) {
    dispatch({
      type: ERROR_FOLLOW_POST,
    })
  }
}

export const unfollowPost = (parentType, id) => async dispatch => {
  try {
    await axios.delete(
      baseURL + `posts/${id}/follow`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );

    dispatch({
      type: SUCCESS_FOLLOW_POST,
    })
  } catch (e) {
    dispatch({
      type: ERROR_FOLLOW_POST,
    })
  }
}


export const updateParentPost = (parent, post) => async dispatch => {
  try {
    const response = await axios.patch(
      baseURL + `spaces/${parent.space_id}/posts`,
      post,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}


export const markAnswer = async (parent, post, postID) => {
  try {
    const response = await axios.post(
      baseURL + `spaces/${parent.space_id}/posts/${post.original_post_id}/answer`,
      {post_id: postID},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}


export const deleteAnswer = async (parent, post) => {
  try {
    const response = await axios.delete(
      baseURL + `spaces/${parent.space_id}/posts/${post.original_post_id}/answer`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )
    return response.data;
  } catch (e) {
    
  }
}

export const completePost = async (parent, postID, completed) => {
  try {
    const response = await axios.patch(
      baseURL + `posts/${postID}/complete`,
      {completed},
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}


export const getPostFollowers = async (parent, postID) => {
  try {
    const response = await axios.get(
      baseURL + `posts/${postID}/follow`,
      store.getState().userActions.jwt ? { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } } : {}
    )

    return response.data;
  } catch (e) {

  }
}


export const pushPostStack = (post) => async dispatch => {
  dispatch({
    type: PUSH_POST_STACK,
    payload: {
      newPost: post,
    },
  })
}

export const popPostStack = () => async dispatch => {
  dispatch({
    type: POP_POST_STACK,
  });
}

export const clearPostStack = () => async dispatch => {
  dispatch({
    type: CLEAR_POST_STACK,
  })
}

export const reverseGeocode = async (lat, long) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.REACT_APP_MAP_KEY}`
    );
  
    return response.data;
  } catch (e) {
    
  }
  
}

export const setTopicList = (topics) => async dispatch => {
  dispatch({
    type: 'SET_TOPIC_LIST',
    payload: {
      topics,
    }
  });
}

export const setSelectedPost = (selected_post) => async dispatch => {
  dispatch({
    type: 'SET_SELECTED_POST',
    payload: {
      selected_post,
    }
  });
}
