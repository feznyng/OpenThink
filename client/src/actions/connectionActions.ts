import store, { AppDispatch } from '../Store';
import axios from "axios";
import {baseURL} from './index';
import { connection } from '../types/user';

export const createConnection = async (connection: connection) => {
    try {
        const response = await axios.post(
        baseURL + `connections`,
        connection,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
        return response.data;
    } catch (e) {

    }
}

export const updateConnection = async (connection: connection) => {
    try {
        const response = await axios.patch(
        baseURL + `connections`,
        connection,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
        return response.data;
    } catch (e) {

    }
}

export const deleteConnection = async (connection_id: number) => {
    try {
        const response = await axios.delete(
        baseURL + `connections/${connection_id}`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
        return response.data;
    } catch (e) {

    }
}

export const getConnection = async (user1Id: number, user2Id: number) => {
    try {
        const response = await axios.get(
        baseURL + `connections/${user1Id}/${user2Id}`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
        return response.data;
    } catch (e) {

    }
}

export const getUserConnections = async (user_id: number) => {
    try {
        const response = await axios.get(
        baseURL + `user/${user_id}/connections`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
        return response.data;
    } catch (e) {

    }
}