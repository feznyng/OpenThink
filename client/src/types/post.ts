import { space } from "./space";
import { tag } from "./tag";
import { user } from "./user";

export interface post {
    post_id: number;
    title: string;
    body: string;
    type: string;
    info: object;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    link: string;
    edited: boolean;
    postId: number;
    anonymous: boolean;
    start_date: Date;
    end_date: Date;
    completed: boolean;
    best_space_answer_id: number;
    best_project_answer_id: number;
    priority: number;
    due_date: Date;
    dueDate: Date;
    latitude: number;
    longitude: number;
    address: string;
    contents: object;
    visibility: number;
    original_post_id: number;
    pinned: boolean;
    original_deleted: boolean;
    hidden: boolean;
    spaces?: space[],
    post_owner_id?: number;
    space_id?: number
    delta?: object;
    assignees?: post_user[],
    tags: tag[]
    attributes?: attribute[],
    full_width?: boolean
}

export interface comment {
    post_id: number;
    project_id: number;
    space_id: number;
    comment_id: number;
    body: string;
    info: any;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    deleted: boolean;
    parent_comment_id: number;
    children: comment[]
    commentID: number;
}

interface post_user {
    user: user
}

export interface vote {
    post_id: number;
    space_id: number;
    project_id: number;
    post_vote_id: number;
    upvote: boolean;
    user_id: number;
}

export interface section {
    space_post_id: number;
    root: boolean;
    name: string;
    color: string;
    space_id: number;
    section_id: number;
    sectionId: number;
    tasks?: space_post[];
    board_id: number;
}


export interface space_post {
    space_post_id: number;
    post_id: number;
    post: post,
}

export enum attribute_type {
    text = 'text',
    number = 'number',
    select = 'select',
    multiSelect = 'Multi-select',
    date = 'date',
    person = 'person',
    space = 'space',
    attachment = 'attachment',
    checkbox = 'checkbox',
    url = 'url',
    email = 'email',
    phone = 'phone',
    currency = 'currency',
    priority = 'priority',
    percent = 'percent',
    duration = 'duration',
    rating = 'rating',
    formula = 'formula',
    relation = 'relation',
    rollup = 'rollup',
    count = 'count',
    barcode = 'barcode',
    button = 'button',
    autonumber = 'autonumber',
    createdTime = 'createdTime',
    createdBy = 'createdBy',
    lastEditedTime = 'lastEditedTime',
    lastEditedBy = 'lastEditedBy',
}

export interface attribute {
    name: string;
    description?: string;
    type: string;
    value?: any;
    hidden?: boolean;
    select_values?: select_value[],
    can_add_select_values?: boolean,
    readonly?: boolean
}

export interface select_value {
    value: string,
    color: string
}