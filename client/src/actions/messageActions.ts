import axios from 'axios';
import { 
  baseURL, 
} from './index';
import store from '../Store';
import { Dispatch } from 'redux';
import { space } from '../types/space';
import { socket } from '../Store';
import { commitMessageNotification } from '../mutations/UpdateRoomNotifications';
import { message } from '../types/message';
import { Channel } from 'phoenix';
import { user } from '../types/user';

const socketMap = new Map();

export const getChannel = (topic: string) => {
    let channel = socketMap.get(topic)
    if (!channel) {
        channel = socket.channel(topic);
        channel.join()
            .receive("ok", () => {})
            .receive("error", ({reason}: {reason: string}) => console.log("failed join", reason) )
            .receive("timeout", () => console.log("Networking issue. Still waiting..."))
        socketMap.set(topic, channel)
    }
    return channel;
}

export const getSpaceChannel: ((topic: string | number) => Channel) = (spaceId) => getChannel(`space:${spaceId}`)
export const getRoomChannel = (roomId: string | number) => getChannel(`room:${roomId}`)
export const getPersonalChannel = () => getChannel(`user:${store.getState().userActions.userInfo.user_id}`)


export const deleteSpaceChannel = (spaceId: string | number) => {
    const channel = getSpaceChannel(spaceId);
    channel.leave();
    socketMap.delete(`space:${spaceId}`)
}
export const deleteRoomChannel = (roomId: string | number) => {
    const channel = getRoomChannel(roomId);
    channel.leave();
    socketMap.delete(`room:${roomId}`)
}

export const setupSpaceChannel = (spaceId: string) => {
    const channel = getPersonalChannel();
    channel.push("join_space", {space_id: spaceId})
}

export const setupPersonalChannel = (userId: string) => {
    
    let channel = socket.channel(`user:${userId}`);

    channel.on("new_msg", (message) => {
        if (store.getState().messageActions.currentRoom !== message.room_id.toString() || !window.location.pathname.includes('messages')) {
            
            commitMessageNotification(message)
        }            
    });

    channel.on("user_typing", (user) => {
        if (store.getState().messageActions.currentRoom === user.room_id.toString() && window.location.pathname.includes('messages')) {
            // add to list of typing users
        }            
    });

    channel.on("user_stopped_typing", (user) => {
        if (store.getState().messageActions.currentRoom === user.room_id.toString() && window.location.pathname.includes('messages')) {
            // remove from list of typing users
        }            
    });

    channel.join()
        .receive("ok", ({messages}) => {})
        .receive("error", ({reason}) => console.log("failed join", reason) )
        .receive("timeout", () => console.log("Networking issue with space. Still waiting..."));
    
    socketMap.set(`user:${userId}`, channel);
}

export const setCurrentRoomId = (roomId: number) => (dispatch: Dispatch) => {
    dispatch({
        type: "SET_CURRENT_ROOM_ID",
        payload: roomId
    })
}

export const openCreateChannelDialog = () => (dispatch: Dispatch) => {
    dispatch({
        type: "OPEN_CREATE_CHANNEL_DIALOG"
    })
}

export const closeCreateChannelDialog = () => (dispatch: Dispatch) => {
    dispatch({
        type: "CLOSE_CREATE_CHANNEL_DIALOG"
    })
}

export const saveMessageDraft = (roomId: string, content: string) => (dispatch: Dispatch) => {
    dispatch({
        type: "SAVE_MESSAGE_DRAFT",
        payload: {roomId, content}
    })
}

export const invalidateMessageDrafts = () => (dispatch: Dispatch) => {
    dispatch({
        type: "DELETE_MESSAGE_DRAFTS",
    })
}


export const setRoomScrollPos = (roomId: number, position?: number) => (dispatch: Dispatch) => {
    dispatch({
        type: "SET_ROOM_POS",
        payload: {roomId, position}
    })
}

export const invalidateRoomScrollPos = () => (dispatch: Dispatch) => {
    dispatch({
        type: "DELETE_ROOM_POS",
    })
}
