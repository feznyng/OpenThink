import {ReducerAction} from './reducerTypes';
import {room} from '../types/message';
import { user } from '../types/user';

interface MessageState {
    currentRoom?: room | null;
    creatingChannel: boolean,
    drafts: any,
    positions: any,
    typingUsers: user[],
}

const initialState: MessageState = {
    currentRoom: null,
    creatingChannel: false,
    drafts: {},
    positions: {},
    typingUsers: [],
};

const messageActionsReducer = (state = initialState, action: ReducerAction) => {
    const { type, payload } = action;
    switch (type) {
        case 'SET_CURRENT_ROOM_ID': {
            const roomId = payload;
            return {
                ...state,
                currentRoom: roomId
            }
        }
        case 'OPEN_CREATE_CHANNEL_DIALOG': {
            return {
                ...state,
                creatingChannel: true
            }
        }
        case 'CLOSE_CREATE_CHANNEL_DIALOG': {
            return {
                ...state,
                creatingChannel: false
            }
        }
        case 'SAVE_MESSAGE_DRAFT': {
            const {content, roomId} = payload;
            const drafts = {...state.drafts};
            drafts[roomId.toString()] = content;
            return {
                ...state,
                drafts
            }
        }
        case 'DELETE_MESSAGE_DRAFTS': {
            return {
                ...state,
                drafts: {}
            }
        }
        case 'SET_ROOM_POS': {
            const {position, roomId} = payload;
            const positions = {...state.positions};
            positions[roomId] = position;
            return {
                ...state,
                positions
            }
        }
        default: {
            return state;
        }
            
    }
}

export default messageActionsReducer;