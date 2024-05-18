import { user } from "./user";

export interface message {
    message_id?: number;
    created_by?: number;
    body?: string;
    room_id?: number;
    edited?: boolean;
    pinned?: boolean;
    created_at?: string;
    updated_at?: Date;
    files?: any;
    reactions?: reaction[]
    firstname?: string,
    lastname?: string,
    profilepic?: string,
    createdAt?: Date,
    user?: user,
    createdBy?: Date,
    messageId?: number,
    delta?: any,
    mentions?: mention[],
    id?: string,
    space_id?: number
}

export interface reaction {
    emoji: string;
    unified: string;
    user_id: number;
    message_id: number;
    name: string;
    users: user[];
}

export interface mention {
    user_id: number;
    message_id?: number;
    post_id?: number;
}


export interface room {
    id?: string;
    room_id?: number;
    name?: string;
    otherUser?: user;
    space_id?: number;
    spaceId?: number;
    archived?: boolean;
    description?: string;
    dm?: boolean;
    created_by?: number;
    created_at?: Date;
    profilepic?: string;
    users?: user[];
    scrollPos?: number;
    offset?: number;
    unread?: boolean | null;
    unreadNum?: number | null;
    hasMore?: boolean;
    scrolledUp?: boolean;
    private?: boolean;
    muted?: boolean;
    notification_settings?: number;
    muted_until?: Date | null,
    roomId?: number,
    visibility?: string,
    type?: string,
}

export interface role {
    role_id: number,
    space_id: number,
    name: string,
    color: string,
    description: string,
    moderator: boolean,
}

export interface category {
    name: string;
    private?: boolean;
    users: (user | role)[]
}