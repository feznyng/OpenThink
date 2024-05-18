import axios from 'axios';
import { 
  baseURL, 
} from './index';
import store from '../Store';

export const getTags = async () => {
    const response = await axios.get(
        baseURL + `tags`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      );
    return response.data;
}
