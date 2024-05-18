import { createSlice } from '@reduxjs/toolkit'
import store from '../../Store'
import { environment } from '../../Store'
import { commitMutation } from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro';
import { DeletePostInput } from '../../mutations/__generated__/DeletePostMutation.graphql'
import { PostInput, WikiSliceCreatePostMutation } from './__generated__/WikiSliceCreatePostMutation.graphql'
import { updatePost } from '../../actions/postActions'
import { throttle } from 'lodash';

export interface User {
    firstname: number | null,
    lastname: number | null,
    profilepic: number | null
}

export interface Post {
    title?: string | null,
    postId: number,
    icon?: string,
    bannerpic?: string,
    description?: string,
    subpostIds?: number[],
    parentPostId?: number,
    open?: boolean
}

interface WikiState {
    posts: {
        [postId: number]: Partial<Post>
    },
    sidebar: number[]
}
  
const initialState: WikiState = {
    posts: {},
    sidebar: []
}

export const wikiSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearStore: (state) => {
        state = initialState
    },
    initializeSidebar: (state) => {
        state.sidebar = []
        state.posts = []
    },
    putPost: (state, {payload}: {payload: Post}) => {
        if (payload.postId)
            state.posts[payload.postId] = {
                ...state.posts[payload.postId],
                ...payload
            }
        else
            throw "Need a postId"
    },
    addSubpostId: (state, {payload}: {payload: {id: number, subpostId: number, location: 'top' | 'bottom' | number}}) => {
        const {id, subpostId, location} = payload
        const post = state.posts[id]
        if (post) {
            const existingIds = post.subpostIds ? post.subpostIds : []
            if (location === 'top') {
                post.subpostIds = [subpostId, ...existingIds]
            } else if (location === 'bottom') {
                post.subpostIds = [...existingIds, subpostId]
            } else {
                post.subpostIds?.splice(location, 0, subpostId)
            }
        }
    },
    removeSubpostId: (state, {payload}: {payload: {postId: number, parentPostId: number}}) => {
        const {postId, parentPostId} = payload
        const post = state.posts[parentPostId]
        if (post)
            post.subpostIds = post.subpostIds?.filter(id => id !== postId)
    },
    reorderSubpostIds: (state, {payload}: {payload: {postId: number, index: number, parentPostId: number}}) => {
        const { postId, index, parentPostId } = payload
        const post = state.posts[parentPostId]
        post.subpostIds = post.subpostIds?.filter(id => id !== postId)
        if (index >= 0) {
            post.subpostIds?.splice(index, 0, postId)
        }
    },
    removePost: (state, {payload}: {payload: number}) => {
        const postToDelete = state.posts[payload]
        if (postToDelete.parentPostId) {
            
        }
        delete state.posts[payload]
    },
    togglePost: (state, {payload}: {payload: number}) => {
        const post = state.posts[payload]
        post.open = !!!post.open
    },
    addSidebarItem: (state, {payload}: {payload: {postId: number, location: 'top' | 'bottom'}}) => {
        const {postId, location} = payload
        if (location === 'top') {
            state.sidebar = [postId, ...state.sidebar]
        } else {
            state.sidebar = [...state.sidebar, postId]
        }
    },
    reorderSidebarItem: (state, {payload}: {payload: {postId: number, index: number}}) => {
        const { postId, index } = payload
        state.sidebar = state.sidebar?.filter(item => item !== postId)
        if (index >= 0) {
            state.sidebar?.splice(index, 0, postId)
        }
    },
    removeSidebarItem: (state, {payload}: {payload: number}) => {
        state.sidebar = state.sidebar.filter((item) => item !== payload)
    },
  },
})

export const { initializeSidebar, clearStore, addSidebarItem, addSubpostId, putPost, togglePost, reorderSidebarItem, removeSidebarItem, removePost, removeSubpostId } = wikiSlice.actions

interface CreatePost {
    parentPostId?: number,
    spaceId: number
}

interface PostChanges {
    postId: number
    title?: string
    delta?: any
    icon?: string
    bannerpic?: string,
    description?: string
}

const commitCreatePost = (post: PostInput, onCompleted: (response: any) => void) => {
    return commitMutation<WikiSliceCreatePostMutation>(
        environment, 
        {
            mutation: graphql`
                mutation WikiSliceCreatePostMutation($input: PostInput!) {
                    createPost(input: $input) {
                        postEdge {
                            node {
                                postId
                            }
                        }
                    }
                }
            `,
            variables: {
                input: post
            },
            onCompleted,
        }
    );
}


const commitUpdatePost = (post: Omit<PostInput, 'deleteRelation'>) => {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation WikiSliceUpdatePostMutation($input: PostInput!) {
                    updatePost(input: $input) {
                        postEdge {
                            node {
                                postId
                            }
                        }
                    }
                }
            `,
            variables: {
                input: post,
            }
        }
    );
}

export const debouncedSavePost = throttle((changes: PostInput) => {
    commitUpdatePost(changes)
}, 500)

const commitDeletePost = (post: DeletePostInput) => {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation WikiSliceDeletePostMutation($input: DeletePostInput!) {
                    deletePost(input: $input) {
                        deletedPostId
                    }
                }
            `,
            variables: {
                input: post,
                deleteSubtree: true,
                deleteRelation: false,
            }
        }
    );
}

export const createPost = ({parentPostId, spaceId}: CreatePost, onComplete: (post: any) => void) => {
    commitCreatePost(
        {
            spaces: [{parentPostId: parentPostId ? parentPostId : null, spaceId}],
            type: 'Wiki',
            title: ''
        },
        ({createPost}) => {
            const post = createPost?.postEdge?.node
            if (post) {
                store.dispatch(putPost({postId: post.postId!!, parentPostId}))
                if (parentPostId) {
                    store.dispatch(addSubpostId({subpostId: post.postId!!, id: parentPostId, location: 'bottom', }))
                } else {
                    store.dispatch(addSidebarItem({postId: post.postId!!, location: 'bottom', }))
                }
                onComplete(post)
            }
        }
    )
}

export const onPostChange = (changes: PostChanges, disableStoreUpdate?: boolean) => {
    !disableStoreUpdate && store.dispatch(putPost(changes))
    debouncedSavePost({
        ...changes,
        delta: JSON.stringify(changes.delta),
        type: 'Wiki',
    })
}

export const deletePost = (post: Post) => {
    if (post.postId) {
        store.dispatch(removePost(post.postId))
        if (post.parentPostId) {
            const {postId, parentPostId} = post
            store.dispatch(removeSubpostId({postId, parentPostId}))
        } else {
            store.dispatch(removeSidebarItem(post.postId))
        }
        commitDeletePost({postId: post.postId, deleteRelations: false})
    }
}

const reorderSubposts = (post: Post) => {
    // reorder subposts
}

export default wikiSlice.reducer