import { createSlice } from '@reduxjs/toolkit'

export interface User {
    firstname: string | null,
    lastname: string | null,
    profilepic: string | null
}

export interface Post {
    title?: string | null,
    postId: number | null,
    icon?: string | null,
    delta?: any,
    body?: string | null,
    author?: User | null,
    entryIds?: string[] | null,
    groupIds?: string[] | null,
    users?: User[],
    assignees?: User[],
    completed?: boolean | null
    tags?: string[],
    numPosts?: number | null
    relationId?: number | null,
    numCompleted?: number | null,
}

interface PostState {
    tasks: {
        [postId: string]: Partial<Post>
    },
}
  
const initialState: PostState = {
    tasks: {}
}

const upsertPost = (state: PostState, postId: string, post: Post) => {
    if (!state.tasks) {
        state.tasks = {}
    }
    
    const existing = state.tasks[postId]
    if (existing) {
        state.tasks[postId] = {
            ...existing,
            ...post
        }
    } else {
        state.tasks[postId] = post
    }
}

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearStore: (state) => {
        state = initialState
    },
    putPost: (state, {payload}: {payload: Post}) => {
        if (payload.postId) {
            upsertPost(state, payload.postId?.toString(), payload)
        } else {
            throw 'Post must contain a postId'
        }
    },
    editPostById: (state, {payload}: {payload: {postId: string, post: Post}}) => {
        const post = state.tasks[payload.postId]
        if (post)
            upsertPost(state, payload.postId?.toString(), payload.post)
    },
    addEntryIds: (state, {payload}: {payload: {id: string, entryIds: string[], location: 'top' | 'bottom' | number}}) => {
        const {id, entryIds, location} = payload
        const post = state.tasks[id]
        if (post) {
            const existingIds = post.entryIds ? post.entryIds : []
            if (location === 'top') {
                post.entryIds = [...entryIds, ...existingIds]
            } else if (location === 'bottom') {
                post.entryIds = [...existingIds, ...entryIds]
            } else {
                post.entryIds = post.entryIds ? post.entryIds : []
                entryIds.forEach(entryId => (
                    post.entryIds!!.splice(location, 0, entryId)
                ))
            }
            post.numPosts = (post.numPosts ? post.numPosts : 0) + entryIds.length
        }
    },
    replaceEntryIds: (state, {payload}: {payload: {id: string, entryIds: string[]}}) => {
        const {id, entryIds} = payload
        const post = state.tasks[id]
        if (post) {
            post.entryIds = entryIds
        }
    },
    removeEntryId: (state, {payload}: {payload: {entryId: string, groupId: string}}) => {
        const {entryId, groupId} = payload
        const post = state.tasks[groupId]
        
        if (post){
            post.entryIds = post.entryIds?.filter(id => id !== entryId)
            post.numPosts = post.numPosts ? post.numPosts - 1 : 0     
        }
    },
    reorderEntryIds: (state, {payload}: {payload: {entryId: string, index: number, groupId: string}}) => {
        const { entryId, index, groupId } = payload
        const post = state.tasks[groupId]
        post.entryIds = post.entryIds?.filter(id => id !== entryId)
        if (index >= 0) {
            post.entryIds?.splice(index, 0, entryId)
        }

    },
    deletePost: (state, {payload}: {payload: string}) => {
        const postToDelete = state.tasks[payload]
        delete state.tasks[payload]
    },
  },
})

export const { addEntryIds, clearStore, reorderEntryIds, replaceEntryIds, putPost, deletePost, removeEntryId, editPostById } = taskSlice.actions

export default taskSlice.reducer