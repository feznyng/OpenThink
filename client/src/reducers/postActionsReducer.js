import { 
  AWAITING_GET_POSTS, 
  SUCCESS_GET_POSTS, 
  ERROR_GET_POSTS,
  AWAITING_GET_POST_BY_ID, 
  SUCCESS_GET_POST_BY_ID, 
  ERROR_GET_POST_BY_ID,
  AWAITING_GET_POSTS_RELATIONS, 
  SUCCESS_GET_POSTS_RELATIONS, 
  ERROR_GET_POSTS_RELATIONS,
  CLEAR_POST_STACK,
  POP_POST_STACK,
  PUSH_POST_STACK,
} from '../actions/index';

const initalState = {
    loading: false,
    postStack: [],
    currPost: undefined,
    topics: [],
    selected_post: null,
};


const postActionsReducer = (state = initalState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case AWAITING_GET_POSTS:
        return {
          ...state,
          loading: true,
        }
      case SUCCESS_GET_POSTS:
        return {
          ...state,
          loading: false,
        }
      case ERROR_GET_POSTS:
        return {
          ...state,
          loading: false,
        }
        
      case AWAITING_GET_POST_BY_ID:
        return {
          ...state,
          loading: true,
          currPost: undefined,
        }
      case SUCCESS_GET_POST_BY_ID:
        return {
          ...state,
          loading: false,
          currPost: payload.currPost,
        }
      case ERROR_GET_POST_BY_ID:
        return {
          ...state,
          loading: false,
          currPost: undefined,
        }

      case AWAITING_GET_POSTS_RELATIONS:
        return {
          ...state,
          loading: true,
          relations: [],
        }
      case SUCCESS_GET_POSTS_RELATIONS:
        return {
          ...state,
          loading: false,
        }
      case ERROR_GET_POSTS_RELATIONS:
        return {
          ...state,
          loading: false,
          relations: [],
        }
      case CLEAR_POST_STACK:
        //console.log('clearing post stack')
        return {
          ...state,
          loading: false,
          postStack: [],
        }
      case PUSH_POST_STACK:
        //console.log('pushing post stack')
        return {
          ...state,
          loading: false,
          postStack: [...state.postStack, payload.newPost],
        }
      case POP_POST_STACK:
        return {
          ...state,
          loading: false,
          postStack: state.postStack.slice(0, state.postStack.length - 1),
        }
      case 'SET_TOPIC_LIST':
      return {
        ...state,
        topics: payload.topics,
      }
      case 'SET_SELECTED_POST':
        return {
          ...state,
          loading: false,
          selected_post: payload.selected_post
        }
      default:
        return state;
    }
  }
  
  export default postActionsReducer;