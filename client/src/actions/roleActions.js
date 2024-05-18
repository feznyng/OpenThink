import axios from "axios";
import { 
    baseURL
  } from './index';
  import store from '../Store';


export const getRoles = (spaceID) => async dispatch => {
    
    try {
        const response = await axios.get(
            baseURL + `spaces/${spaceID}/roles`,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
            )
        
        dispatch({
            type: 'SET_ROLES',
            payload: response.data
        })
    } catch (e) {
        console.log(e)
    }
}


export const createRole = (spaceID, role) => async dispatch => {
    try {
        const response = await axios.post(
            baseURL + `spaces/${spaceID}/roles`,
            role,
            { 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } 
            }
        )
            
        dispatch({
            type: 'CREATE_ROLE',
            payload: {...role, role_id: response.data.role_id}
        })
    } catch (e) {
        console.log(e)
    }
}

export const deleteRole = (role) => async dispatch => {
    try {
        const response = await axios.delete(
            baseURL + `roles/${role.role_id}`,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
            )

        dispatch({
            type: 'DELETE_ROLE',
            payload: role
        })
    } catch (e) {
        console.log(e)
    }
}
export const updateRole = (role) => async dispatch => {
    dispatch({
        type: 'UPDATE_ROLE',
        payload: role
    })
}

export const updateRoleOrder = (roles) => async dispatch => {
    console.log(roles.map(r => r.name))
    dispatch({
        type: 'UPDATE_ROLE_ORDER',
        payload: roles
    })
}



export const updateSpaceRoles = (spaceID, roles) => async dispatch => {
    try {
        const response = await axios.patch(
            baseURL + `spaces/${spaceID}/roles`,
            roles,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
            )

        dispatch({
            type: 'UPDATE_SPACE_ROLES',
            payload: roles
        })
    } catch (e) {
        console.log(e)
    }
}

export const editRole = (role) => dispatch => {
    dispatch({
        type: 'EDIT_ROLE',
        payload: role
    });
}

export const assignRole = (spaceUserId, roles) => async dispatch => {
    try {
        const response = await axios.patch(
            baseURL + `spaces/users/${spaceUserId}/roles`,
            roles,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
            )

        dispatch({
            type: 'ASSIGN_ROLES',
            payload: {roles, spaceUserId}
        });
    } catch (e) {
        console.log(e)
    }
}

export const addRoleUsers = (role_id, users) => async dispatch => {
    try {
        const response = await axios.patch(
            baseURL + `roles/${role_id}/users`,
            users,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
            
        dispatch({
            type: 'ADD_USER_ROLES',
            payload: {users, role_id}
        });
    } catch (e) {
        console.log(e)
    }
}

export const deleteRoleUser = (role_id, user) => async dispatch => {
    try {
        
        const response = await axios.delete(
            baseURL + `roles/${role_id}/users/${user.space_user_id}`,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
        )
          
        dispatch({
            type: 'DELETE_ROLE_USER',
            payload: {user, role_id}
        });
    } catch (e) {
        console.log(e)
    }
}
