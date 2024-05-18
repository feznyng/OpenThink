import axios from "axios";
import { 
    baseURL
  } from './index';
  import store from '../Store';

export const getSkills = async () => {
    const response = await axios.get(
        baseURL + `skills`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    return response.data;
}

export const getTopics = async () => {
    const response = await axios.get(
        baseURL + `topics`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    return response.data;
}

export const updateUserTopics = async (user_id: number, created: string[], deleted: string[]) => {
    const response = await axios.patch(
        baseURL + `user/${user_id}/topics`,
        {created, deleted},
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    return response.data;
}

export const updateUserSkills = async (user_id: number, created: string[], deleted: string[]) => {
    const response = await axios.patch(
        baseURL + `user/${user_id}/skills`,
        {created, deleted},
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    );
    return response.data;
}