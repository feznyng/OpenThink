import {post} from './post';
import { tag } from './tag';
import { user } from './user';

export interface space {
    space_id?: number,
    parent_space_id?: number,
    name: string,
    description: string,
    type: string,
    bannerpic: string,
    profilepic: string,
    city: boolean,
    state: boolean,
    longitude: number,
    latitude: number,
    created_at: Date,
    hidden: boolean,
    info: object,
    address: string,
    users: user[],
    project: boolean,
    start_date: Date,
    end_date: Date,
    space_type: string,
    posts: post[];
    default_banner?: boolean;
    tags: tag[],
    last_room_id?: number,
    spaceId?: number,
    space_user: user,
    projectType?: string,
    groupType?: string,
    causes?: string[],
    parentSpaceId?: number | null,
    invitedUserIds?: number[],
    invitedRoleIds?: number[],
    invitedGroupIds?: number[]
    inviteAllParentSpaceMembers?: boolean,
    emails?: string[],
    accessType?: string
    spaceType?: string
    allSpaceMembers?: boolean
}

export interface rule {
    name: string;
    description: string
}