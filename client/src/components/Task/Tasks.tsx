import { Paper, Slide } from '@material-ui/core';
import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import TaskPostViewQuery from './__generated__/TaskPostViewQuery.graphql';
import {useQueryLoader, usePaginationFragment, useMutation} from 'react-relay';
import TaskPostView, { TaskPostViewProps } from './TaskPostView';
import graphql from 'babel-plugin-relay/macro';
import { getPriorityNum } from '../../utils/taskutils';
import Dialog from '../Shared/Dialog';
import List from "../DatabaseViews/ListView";
import Board from "../DatabaseViews/BoardView";
import { Group, Attribute, AttributeValue, Entry, DatabaseViewProps } from '../../types/database';
import { TasksPaginationQuery } from './__generated__/TasksPaginationQuery.graphql'
import { TasksFragment$key } from './__generated__/TasksFragment.graphql'
import { addEntryIds, clearStore, deletePost, putPost, removeEntryId, reorderEntryIds } from './TaskSlice';
import store, { useAppDispatch, useAppSelector } from '../../Store';
import { DropResult } from 'react-beautiful-dnd';
import AddTaskListItem from './AddTaskListItem';
import commitDeletePost from '../../mutations/DeletePost';
import { Anchor } from '../Post/PostContentEditor';
import CreateSectionButton from './CreateSectionButton';
import commitBatchDeletePost from '../../mutations/BatchDeletePost';
import { attributes, makeSelectEntry, makeSelectGroup, changeAttributeValue, onPostChange } from './TaskUtils'
import { TasksCreateSectionMutation } from './__generated__/TasksCreateSectionMutation.graphql';
import { TasksCreatePostMutation } from './__generated__/TasksCreatePostMutation.graphql';
import { TasksReorderMoveTaskMutation } from './__generated__/TasksReorderMoveTaskMutation.graphql';
import { TasksDeleteRelationMutation } from './__generated__/TasksDeleteRelationMutation.graphql';
import { TasksCreateRelationMutation } from './__generated__/TasksCreateRelationMutation.graphql';
import { TasksRemoveEntryMutation } from './__generated__/TasksRemoveEntryMutation.graphql';
import { TasksAddEntryMutation } from './__generated__/TasksAddEntryMutation.graphql';
import { fetchQuery } from '../../utils/graphqlutils';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';

const taskFragment = graphql`
    fragment TasksFragment_task on Post {
        postId
        title
        priority
        dueDate
        completed
        deleted
        tags(first: 20) {
            edges {
                node {
                    tag
                }
            }
        }
        numPosts(filterTypes: ["Task"])
        numCompleted: numPosts(filterTypes: ["Task"], completed: true)
        users(userTypes: ["Assignee"], first: 100) {
            edges {
                node {
                    userId
                    profilepic
                    firstname
                    lastname
                }
            }
        }
    }
`

interface TasksProps {
    source: any,
    tab: string,
    style?: React.CSSProperties,
    openTask: (postID: number | string) => void,
    closeTask: () => void
    postId?: number,
    taskPostViewProps?: TaskPostViewProps,
    dialogOnly?: boolean,
    spaceId?: number,
    fixedHeight?: number
}

interface TasksState {
    openSections: string[],
    groupIds: string[],
    entryIds: string[],
    editingAttribute: number | null
    editingAnchor: null,
    anchorEl: Anchor,
    sectionTitle: '',
    groupId?: string,
}

export default function Tasks({source, spaceId, tab, style, openTask, closeTask, fixedHeight, dialogOnly, postId, taskPostViewProps}: TasksProps) {
    const {data} = usePaginationFragment<TasksPaginationQuery, TasksFragment$key>(
        graphql`
            fragment TasksFragment on Space      
            @refetchable(queryName: "TasksPaginationQuery") {
                permissions {
                    canCreateSections
                    canPost
                }
                views(first: 1, purpose: ["Task"], defaultView: true) {
                    edges {
                        node {
                            viewId
                            groupIds
                        }
                    }
                }
                posts(first: 1000, filterTypes: ["Task"], excludeParentTypes: ["Task Section", "Task"], viewPurpose: "Task") {
                    edges {
                        node {
                            ...TasksFragment_task @relay(mask: false)
                        }
                    }
                }
                numPosts(filterTypes: ["Task"], excludeParentTypes: ["Task Section", "Task"])
                sections(first: $taskCount, after: $taskCursor) @connection(key: "TasksFragment_sections") {       
                    __id
                    edges {
                        node {
                            numPosts(filterTypes: ["Task"], excludeParentTypes: ["Task"])
                            postId
                            title
                            icon
                            color
                            views(first: 1, defaultView: true, purpose: ["Task"]) {
                                edges {
                                    node {
                                        viewId
                                    }
                                }
                            }
                            deleted
                            posts(first: 100000000, filterTypes: ["Task"], excludeParentTypes: ["Task"], viewPurpose: "Task") {
                                __id
                                edges {
                                    node {
                                        ...TasksFragment_task @relay(mask: false)
                                        parentRelation {
                                            relationId
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
        source
    )

    const permissions = data?.permissions
    
    const viewIds = data.sections?.edges ? data.sections.edges.filter(e => e?.node?.views?.edges && e.node.views.edges.length > 0)
    .map(e => {
        const views = e?.node!!.views!!.edges
        if (views && views.length > 0)
            return {
                viewId: views[0]!!.node!!.viewId,
                postId: e?.node.postId
            }
    }) : []

    const view = data.views?.edges?.map(e => e!!.node)[0]

    const [createTask] = useMutation<TasksCreatePostMutation>(
        graphql`
            mutation TasksCreatePostMutation($input: PostInput!) {
                createPost(input: $input) {
                    postEdge {
                        node {
                            postId
                            title
                            priority
                            dueDate
                            completed
                            deleted
                            tags {
                                edges {
                                    node {
                                        tag
                                    }
                                }
                            }
                            users(userTypes: ["Assignee"], first: 100) {
                                edges {
                                    node {
                                        userId
                                        profilepic
                                        firstname
                                        lastname
                                    }
                                }
                            }
                            parentRelation {
                                relationId
                            }
                        }
                    }
                }
            }
        `
    )

    const [createSection] = useMutation<TasksCreateSectionMutation>(
        graphql`
            mutation TasksCreateSectionMutation($input: PostInput!) {
                createPost(input: $input) {
                    postEdge {
                        node {
                            title
                            color
                            postId
                        }
                    }
                }
            }
        `
    )

    const [putEntry] = useMutation(
        graphql`
            mutation TasksputEntryMutation($input: ReorderEntryInput) {
                putEntry(input: $input) {
                    id
                }
            }
        `
    )

    const [putGroup] = useMutation(
        graphql`
            mutation TasksputGroupMutation($input: ReorderGroupInput) {
                putGroup(input: $input) {
                    id
                }
            }
        `
    )
    const [moveTask] = useMutation<TasksReorderMoveTaskMutation>(
        graphql`
            mutation TasksReorderMoveTaskMutation($input: MovePostInput!) {
                movePost(input: $input) {
                    deletedRelationId
                    relation {
                        id
                        post1Id
                        post2Id
                        relationId
                    }
                }
            }
        `
    )

    const [createRelation] = useMutation<TasksCreateRelationMutation>(
        graphql`
            mutation TasksCreateRelationMutation($input: CreateRelationInput!) {
                createRelation(input: $input) {
                    postEdge {
                        node {
                            parentRelation {
                                relationId
                            }
                        }
                    }
                }
            }
        `
    )

    const [removeEntry] = useMutation<TasksRemoveEntryMutation>(
        graphql`
            mutation TasksRemoveEntryMutation($input: RemoveEntryInput!) {
                removeEntry(input: $input) {
                    viewId
                }
            }
        `
    )

    const [addEntryId] = useMutation<TasksAddEntryMutation>(
        graphql`
            mutation TasksAddEntryMutation($input: ReorderEntryInput!) {
                putEntry(input: $input) {
                    viewId
                }
            }
        `
    )
    
    const [deleteRelation] = useMutation<TasksDeleteRelationMutation>(
        graphql`
            mutation TasksDeleteRelationMutation($input: DeleteRelationInput!) {
                deleteRelation(input: $input) {
                    deletedRelationId
                }
            }
        `
    )
    
    const [state, setState] = React.useState<TasksState>({
        openSections: data.sections?.edges ? ['-1', ...data.sections.edges.map(e => e!!.node!!.postId!!.toString())] : ['default'],
        groupIds: [],
        entryIds: [],
        editingAnchor: null,
        editingAttribute: -1,
        sectionTitle: '',
        anchorEl: null
    })

    const dispatch = useAppDispatch()

    React.useEffect(() => {
        dispatch(clearStore())
        const groupIds: string[] = data.sections?.edges ? data.sections.edges.map((eg) => {
            const { postId, posts } = eg!!.node!!;
    
            const entryIds: string[] = posts?.edges ? posts.edges.map(rp => {
                const { postId, users, tags, parentRelation, numPosts, numCompleted } = rp!!.node!!
                dispatch(putPost({
                    ...rp!!.node!!,
                    users: users?.edges ? users.edges.map(e => e!!.node!!) : [],
                    tags: tags?.edges ? tags.edges.map((e: any) => e.node.tag) : [],
                    relationId: parentRelation?.relationId,
                    numPosts,
                    numCompleted
                }))
                return postId!!.toString()!!
            }) : []
    
            dispatch(putPost({
                ...eg!!.node!!, 
                numPosts: eg!!.node!!.numPosts ? eg!!.node!!.numPosts : 0,
                entryIds
            }))
    

            return postId!!.toString()
        }) : []

        const entryIds = data.posts?.edges ? data.posts.edges.map(p => {
            const { postId, users, tags, numPosts, numCompleted } = p!!.node!!
            dispatch(putPost({
                ...p!!.node!!,
                users: users?.edges ? users.edges.map(e => e!!.node!!) : [],
                tags: tags?.edges ? tags.edges.map((e: any) => e.node.tag) : [],
                numPosts,
                numCompleted
            }))
            return postId!!.toString()
        }) : []

        dispatch(putPost({title: 'Default', postId: -1, entryIds, numPosts: data.numPosts ? data.numPosts : 0}))

        let viewGroupIds: string[] = []
        
        if (view?.groupIds) {
            viewGroupIds = [...view?.groupIds]
            if (!viewGroupIds.includes('-1'))
                viewGroupIds.unshift('-1')
        }

        setState({
            ...state,
            groupIds: viewGroupIds ? [...viewGroupIds.filter(id => groupIds.includes(id) || id === '-1')] : ['-1', ...groupIds],
        })
    }, [])

    const [    
        postViewQueryRef,
        loadPostViewQuery,
    ] = useQueryLoader(    
        TaskPostViewQuery,    
    );

    React.useEffect(() => {
        if (postId) {
            loadPostViewQuery({postId, taskCount: 100000, spaceId}, {fetchPolicy: 'network-only'})
        }
    }, [postId])

    const addEntry = React.useMemo(() => (location: 'top' | 'bottom' | number, group?: Group | null, entry?: Entry) => {
        let index = 0

        if (location === 'bottom') {
            if (group) {
                index = group.count
            } else {
                index = data.numPosts!!
            }
        } else if (location === 'top') {
            index = 0
        } else {
            index = location
        }

        const groupId = group?.id ? parseInt(group.id) : undefined

        const input = {
            title: '',
            spaces: [{spaceId: spaceId!!, parentPostId: groupId && groupId > 0 ? groupId : null, index, current: true}],
            type: "Task"
        }

        if (entry) {
            const attrValues = entry.attributeValues
            input.title = attrValues["Title"].value
        }

        createTask({
            variables: {
                input
            },
            onCompleted: (response) => {
                const newPost = response.createPost?.postEdge?.node
                if (newPost) {
                    dispatch(putPost({
                        ...newPost,
                        relationId: newPost.parentRelation?.relationId,
                        tags: [], 
                        users: (newPost.users!!.edges!!.map((e: any) => e.node) as any)
                    }))
                    const entryId = newPost.postId!!.toString()
                    if (group) {
                        dispatch(addEntryIds({id: group.id, entryIds: [entryId], location}))
                    } else {
                        setState({
                            ...state,
                            entryIds: [...state.entryIds, entryId]
                        })
                    }
                }
            }
        })
    }, [])
    
    const addGroup = (_: 'bottom' | 'top' | number, {value}: AttributeValue) => {
        const input = {
            title: value,
            spaces: [{spaceId: spaceId!!}],
            type: "Task Section"
        }
        
        createSection({
            variables: {
                input
            },
            onCompleted: (response: any) => {
                const newPost = response.createPost?.postEdge?.node
                if (newPost) {
                    dispatch(putPost(newPost))
                    const groupId = newPost.postId!!.toString()
                    setState({
                        ...state,
                        groupIds: [...state.groupIds, groupId],
                        openSections: [...state.openSections, groupId]
                    })
                }
            }
        })
    }

    const getViewFromGroupId = (groupId: string) => {
        let viewId: number | null | undefined = viewIds.find(v => v?.postId?.toString() === groupId)?.viewId
        if (!viewId) {
            viewId = view?.viewId
        }
        return viewId
    }
    const openEntry = (entry: Entry, groupId?: string) => {
        openTask(entry.id)
        setState({
            ...state,
            groupId
        })
    }
    
    const fetchSubEntries = (entry: Entry) => {
        fetchQuery(
            graphql`
                query TasksSubTasksQuery($postId: ID!) {
                    post(postId: $postId) {
                        posts(first: 20, filterTypes: ["Task"], viewPurpose: "Task") {
                            pageInfo {
                                hasNextPage
                            }
                            edges {
                                node {
                                    postId
                                    title
                                    priority
                                    dueDate
                                    completed
                                    deleted
                                    tags {
                                        edges {
                                            node {
                                                tag
                                            }
                                        }
                                    }
                                    parentRelation {
                                        relationId
                                    }
                                    users(userTypes: ["Assignee"], first: 100) {
                                        edges {
                                            node {
                                                userId
                                                profilepic
                                                firstname
                                                lastname
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            {
                postId: entry.id
            }
        ).subscribe({
            next: (data: any) => {
                const entryIds: string[] = data.post.posts?.edges ? data.post.posts.edges.map((rp: any) => {
                    const { postId, users, tags, parentRelation, numPosts } = rp!!.node!!
                    dispatch(putPost({
                        ...rp!!.node!!,
                        users: users?.edges ? users.edges.map((e: any) => e!!.node!!) : [],
                        tags: tags?.edges ? tags.edges.map((e: any) => e.node.tag) : [],
                        relationId: parentRelation?.relationId,
                        numPosts
                    }))
                    return postId!!.toString()!!
                }) : []
        
                dispatch(putPost({
                    postId: parseInt(entry.id),
                    entryIds
                }))
            }
        })

    }
    
    const taskProps: DatabaseViewProps = useMemo(() => ({
        canAddAttribute: false,
        canAddGroup: !!permissions?.canCreateSections,
        canAddEntry: !!permissions?.canPost?.includes('Task'),
        addEntryIdText: 'Add Task',
        groupIds: state.groupIds,
        attributes,
        addEntryText: 'Add Task',
        addEntry,
        deleteEntry: (entry: Entry, groupId?: string) => {
            if (groupId)
                dispatch(removeEntryId({entryId: entry.id, groupId}))
            commitDeletePost({postId: parseInt(entry.id), deleteRelations: false})
            dispatch(deletePost(entry.id))
        },
        onDragEnd: (result: DropResult) => {

            if (!result.destination) {
                return;
            }
            const sourceIndex = result.source.index;
            const destIndex = result.destination.index;
            if (destIndex < 0)
                return;
            if (result.type === "droppableItem") {
                if (sourceIndex === destIndex || destIndex === state.groupIds!!.length) {
                  return;
                }
                const groupId = result.draggableId.split(":")[1]!!
                const newGroupIds = state.groupIds.filter(id => id !== groupId)
                newGroupIds.splice(destIndex, 0, groupId)
                setState({
                    ...state,
                    groupIds: newGroupIds
                })

                if (view?.viewId)
                    putGroup({
                        variables: {
                            input: {
                                groupId,
                                viewId: view.viewId,
                                index: destIndex - 1
                            }
                        }
                    })
            } else { 
                const sourceParentId = result.source.droppableId;
                const destParentId = result.destination.droppableId;
                const entryId = result.draggableId.split(":")[1]
                const groupId = destParentId.split(":")[1]

                if (sourceParentId === destParentId) {
                    dispatch(reorderEntryIds({entryId, index: destIndex, groupId}))                    
                    const viewId = getViewFromGroupId(groupId)
                    if (viewId)
                        putEntry({
                            variables: {
                                input: {
                                    viewId,
                                    index: destIndex,
                                    entryId: parseInt(entryId)
                                }
                            }
                        })
                } else {
                    const sourceGroupId = sourceParentId.split(":")[1]
                    dispatch(removeEntryId({entryId, groupId: sourceGroupId}))
                    dispatch(addEntryIds({entryIds: [entryId], id: groupId, location: destIndex}))

                    const viewId = getViewFromGroupId(groupId)
                    if (sourceGroupId === '-1') {
                        removeEntry({
                            variables: {
                                input: {
                                    viewId: view!!.viewId!!,
                                    entryId: parseInt(entryId)
                                }
                            }
                        })
                        createRelation({
                            variables: {
                                input: {
                                    viewId,
                                    postId: parseInt(entryId),
                                    parentPostId: parseInt(groupId),
                                    spaceId,
                                    index: destIndex,
                                }
                            },
                            onCompleted: (response) => {
                                dispatch(putPost({
                                    postId: parseInt(entryId),
                                    relationId: response.createRelation?.postEdge?.node?.parentRelation?.relationId,
                                }))
                            }
                        })
                    } else if (groupId === '-1') {
                        const post = store.getState().task.tasks[entryId]
                        deleteRelation({
                            variables: {
                                input: {
                                    relationId: post.relationId
                                }
                            }
                        })
                        addEntryId({
                            variables: {
                                input: {
                                    viewId: view!!.viewId!!,
                                    entryId: parseInt(entryId),
                                    index: destIndex
                                }
                            }
                        })
                    } else {
                        const post = store.getState().task.tasks[entryId]
                        if (viewId && post.relationId) {
                            moveTask({
                                variables: {
                                    input: {
                                        viewId,
                                        postId: parseInt(entryId),
                                        index: destIndex,
                                        spaceId,
                                        newParentPostId: parseInt(groupId),
                                        existingRelationId: post.relationId,
                                    }
                                },
                                onCompleted: (response: any) => {
                                    dispatch(putPost({
                                        postId: parseInt(entryId),
                                        relationId: response.movePost.relation.relationId
                                    }))
                                }
                            })
                        }
                    }
                }
            }
        },
        addGroup,
        entryViewProps: {
            showButton: true,
            openEntry,
            changeAttributeValue,
            completable: true,
            makeSelectEntry,
            showSubEntries: true,
            fetchSubEntries,
        },
        groupViewProps: {
            canEditGroup: true,
            makeSelectGroup,
            editGroup: (group: Group) => {
                
            },
            changeAttribute: ({ name, id, options }: Attribute) => {
                const {value, color} = options!![0]!!
                id && onPostChange({postId: parseInt(id), title: value, color, type: "Task Section"})
            },
            toggleGroup: (group: Group) => {
                if (state.openSections.includes(group.id)) {
                    setState({
                        ...state,
                        openSections: state.openSections.filter(id => id !== group.id)
                    })
                } else {
                    setState({
                        ...state,
                        openSections: [...state.openSections, group.id]
                    })
                }
            },
            deleteGroup: (group: Group, keepEntries?: boolean) => {
                setState({
                    ...state,
                    groupIds: state.groupIds.filter(groupId => groupId !== group.id)
                })
                if (keepEntries) {
                    dispatch(addEntryIds({id: '-1', entryIds: group.entryIds, location: 'bottom'}))
                } else {
                    group.entryIds && group.entryIds.forEach(id => {
                        dispatch(removeEntryId({entryId: id, groupId: group.id}))
                        dispatch(deletePost(id))
                    })
                    commitBatchDeletePost({postIds: group.entryIds.map(id => parseInt(id)), deleteRelations: false})
                }
                dispatch(deletePost(group.id))
                commitDeletePost({postId: parseInt(group.id), deleteRelations: true})
            }
        },
        expandedGroups: state.openSections,
        addGroupButton: (
            <CreateSectionButton
                createSection={(group) => addGroup('bottom', group)}
            />
        ),
        requireEntry: true,
        AddListItem: AddTaskListItem
    }), [state.groupIds, state.openSections]);

    const postView = (
        <Suspense
            fallback={<div/>}
        >
            <TaskPostView
                {...taskPostViewProps}
                queryRef={postViewQueryRef}
                style={{width: '100%'}}
                onClose={closeTask}
                onChange={onPostChange}
                changeAttributeValue={changeAttributeValue}
                openEntry={openEntry}
                spaceId={spaceId}
                view={tab}
                editable={!!permissions?.canPost?.includes('Task')}
            />
        </Suspense>
    )

    return (
        <div style={{...style,}}>
            <div style={{display: 'flex', overflow: 'auto', position: 'relative'}}>
                {
                    tab === 'list' &&
                    <MaxWidthWrapper
                        width={800}
                    >
                        <List
                            {...taskProps}
                        />
                    </MaxWidthWrapper>
                }
                {
                    tab === 'board' &&
                    <Board
                        {...taskProps}
                        fixedHeight={fixedHeight}
                    />
                }
                <Dialog
                    open={!!(postViewQueryRef && postId)}
                    disableCloseButton
                    onClose={closeTask}
                >
                    <div
                        style={{width: 600, minHeight: 600}}
                    >
                        {postView}
                    </div>
                </Dialog>
            </div>
        </div>
    )
}