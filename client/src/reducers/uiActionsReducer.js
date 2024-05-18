import { 
    SETTING_SIDEBAR
  } from '../actions/index';
  
const initalState = {
    open: false,
    darkMode: false,
    menuHeight: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    nav: true
};


const uiActionsReducer = (state = initalState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case SETTING_SIDEBAR:
        return {
          ...state,
          open: payload
        }
      case 'SETTING_DARK_MODE':
        return {
          ...state,
          darkMode: payload
        }
      case 'SET_ONBOARDING':
        return {
          ...state,
          onboarding: payload
        }
      case 'SET_NAV':
        return {
          ...state,
          nav: payload
        }
      case 'SET_MENU_HEIGHT':
        return {
          ...state,
          menuHeight: payload
        }
      case 'SET_WINDOW_DIMS': {
        const {height, width} = payload;
        return {
          ...state,
          height,
          width
        }
      }
      case 'SET_MOBILE_LAYOUT': 
        return {
          ...state,
          mobile: payload
        }
      default:
        return state;
    }
  }
  
  export default uiActionsReducer;