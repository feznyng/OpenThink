import { post } from "./post";

export interface user {
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    active: boolean;
    profilepic: string;
    bannerpic: string;
    phonenumber: number;
    address: string;
    city: boolean;
    state: boolean;
    longitude: number;
    latitude: number;
    hash: string;
    accepted: boolean;
    salt: string;
    profession: string;
    pronouns: string;
    bio: string;
    created_at: Date;
    updated_at: Date;
    birthdate: Date;
    unread_messages: boolean;
    preferences: any;
    google_id: string;
    status: string;
    default_banner?: boolean;
    type?: string;
    roles?: role[];
    connection?: connection,
    userId?: Number
}

interface role {
    name: string,
    color?: string,
    user1_id?: number,
    user2_id?: number,
    connection_id?: number,
    accepted?: boolean,
    connection_accepted?: boolean;
    connection_created_at?: Date,
    posts?: post[],
    connection?: connection,
    onboarding_completed?: boolean,
    unread_announcements?: number
}

export interface connection {
    user1_id?: number | null,
    user2_id?: number | null,
    created_at?: Date | null,
    connection_id?: number | null,
    accepted?: boolean | null,
    connection_accepted?: boolean | null,
    connection_created_at?: Date | null
}