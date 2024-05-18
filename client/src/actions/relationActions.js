import axios from "axios";
import {baseURL} from './index';
import store from '../Store';

export const updateTaskOrder = async (parent, tasks) => {
    try {
      const response = await axios.patch(
        baseURL + `spaces/${parent.space_id}/tasks`,
        tasks,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
}