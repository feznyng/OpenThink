import { 
  AWAITING_GET_PROJECTS, 
  SUCCESS_GET_PROJECTS, 
  ERROR_GET_PROJECTS,
  AWAITING_GET_PROJECT_BY_ID, 
  SUCCESS_GET_PROJECT_BY_ID, 
  ERROR_GET_PROJECT_BY_ID,
} from '../actions/index';

const initalState = {
    loading: false,
    allProjects: [],
    currProject: null,
};

const projectActionsReducer = (state = initalState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case AWAITING_GET_PROJECTS:
        return {
          ...state,
          loading: true,
          allProjects: [],
        }
      case SUCCESS_GET_PROJECTS:
        return {
          ...state,
          loading: false,
          allProjects: payload.allProjects,
        }
      case ERROR_GET_PROJECTS:
        return {
          ...state,
          loading: false,
          allProjects: [],
        }
      case AWAITING_GET_PROJECT_BY_ID:
        return {
          ...state,
          loading: true,
          currProject: null,
        }
      case SUCCESS_GET_PROJECT_BY_ID:
        return {
          ...state,
          loading: false,
          currProject: payload.currProject,
        }
      case ERROR_GET_PROJECT_BY_ID:
        return {
          ...state,
          loading: false,
          currProject: null,
        }
      default:
        return state;
    }
  }
  
  export default projectActionsReducer;