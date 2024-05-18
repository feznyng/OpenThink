import { 
  SETTING_SIDEBAR,
  baseURL
} from './index'; 
import axios from "axios";
import store from '../Store';

export const setupScreenListeners = () => async dispatch => {
  dispatch({
    type: 'SET_WINDOW_DIMS',
    payload: {height: window.innerHeight, width: window.innerWidth}
  });
  window.addEventListener('resize', () => {
    dispatch({
      type: 'SET_WINDOW_DIMS',
      payload: {height: window.innerHeight, width: window.innerWidth}
    })
  });
}

export const setOnboarding = (open) => async dispatch => {
  dispatch({
      type: 'SET_ONBOARDING',
      payload: open
  });
};

export const setNav = (open) => async dispatch => {
  dispatch({
      type: 'SET_NAV',
      payload: open
  });
};

export const setSidebar = (open) => async dispatch => {
  dispatch({
      type: SETTING_SIDEBAR,
      payload: open
  });
};
export const setDarkMode = (enabled) => async dispatch => {
  console.log({dark_mode: enabled})
  const response = await axios.patch(
    baseURL + 'account/preferences',
    {dark_mode: enabled},
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
  );

  dispatch({
      type: 'SETTING_DARK_MODE',
      payload: enabled
  });
};

export const setMenuHeight = (height) => async dispatch => {
  dispatch({
      type: 'SET_MENU_HEIGHT',
      payload: height
  });
};

export const setMobileLayout = (width) => async dispatch => {
  dispatch({
      type: 'SET_MOBILE_LAYOUT',
      payload: width === 'xs' || width === 'sm'
  });
};

export const getAnnouncements = async (limit) => {
  const response = await axios.get(
    baseURL + `announcements?limit=${limit}`,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
  )

  return response.data;
}

export const closeAnnouncement = async () => {
  const response = await axios.delete(
    baseURL + `announcements`,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
  )
  return response.data;
}