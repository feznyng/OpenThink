import React, { CSSProperties, useRef } from 'react'
import graphql from 'babel-plugin-relay/macro';
import {useFragment, useMutation, usePaginationFragment} from 'react-relay';
import { ButtonProps, Typography } from '@material-ui/core';
import Button from '../Shared/Button';
import { Add, Share } from '@material-ui/icons';
import { SubtasksPaginationQuery } from './__generated__/SubtasksPaginationQuery.graphql';
import { SubtasksFragment$key } from './__generated__/SubtasksFragment.graphql';
import List from '../DatabaseViews/ListView';
import { attributes, makeSelectEntry, changeAttributeValue,  } from './TaskUtils'
import { useAppDispatch, useAppSelector } from '../../Store';
import { addEntryIds, deletePost, putPost, removeEntryId, reorderEntryIds, replaceEntryIds } from './TaskSlice';
import AddTaskListItem from './AddTaskListItem';
import { SubtasksCreatePostMutation } from './__generated__/SubtasksCreatePostMutation.graphql';
import { useParams } from 'react-router';
import { DropResult } from 'react-beautiful-dnd';
import commitDeletePost from '../../mutations/DeletePost';
import { Entry, Group } from '../../types/database';
import { defaultPostCardArgs } from '../../mutations/CreatePost';

interface SubtasksProps {
    style?: CSSProperties
    post: any,
    addButtonProps?: Partial<ButtonProps>,
    openEntry: (entry: Entry) => void,
    connectionIds?: string[],
    editable?: boolean
}

const AddSubtask = ({...props}: any) => {
    return (
        <Button
            startIcon={<Add/>}
            size="small"
            variant="outlined"
            {...props}
        >
            Add subtask
        </Button>
    )
}

export default React.forwardRef(function Subtasks({post, editable, style, openEntry, connectionIds}: SubtasksProps, ref) {
    const {data, hasNext} = usePaginationFragment<SubtasksPaginationQuery, SubtasksFragment$key>(    
        graphql`      
            fragment SubtasksFragment on Post
            @refetchable(queryName: "SubtasksPaginationQuery") {
                __id
                postId
                views(first: 1, defaultView: true, purpose: ["Task"]) {
                    edges {
                        node {
                            viewId
                        }
                    }
                }
                numSubtasks: numPosts(filterTypes: ["Task"])
                subtasks: posts(first: $taskCount, after: $taskCursor, filterTypes: ["Task"], viewPurpose: "Task") @connection(key: "SubtasksFragment_subtasks") {
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
        `,
        post
    );
    const { subtasks } = data
    const view = data.views?.edges!![0]?.node

    const dispatch = useAppDispatch()
    const currPost = useAppSelector(state => data.postId ? state.task.tasks[data.postId] : null)
    const entryIds = currPost?.entryIds
    const listRef = useRef()

    React.useEffect(() => {
        if (!currPost && post.postId)
            dispatch(putPost(post))
        if (data.postId) {
            const entryIds: string[] = subtasks?.edges ? subtasks.edges.map(rp => {
                const { postId, users, tags, parentRelation } = rp!!.node!!
                dispatch(putPost({
                    ...rp!!.node!!,
                    users: users?.edges ? users.edges.map(e => e!!.node!!) : [],
                    tags: tags?.edges ? tags.edges.map((e: any) => e.node.tag) : [],
                    relationId: parentRelation?.relationId
                }))
                return postId!!.toString()!!
            }) : []
            dispatch(replaceEntryIds({id: data.postId.toString(), entryIds}))
        }
        
    }, [data.postId])


    React.useImperativeHandle(ref, () => ({
        openSubtaskCreator: () => (listRef.current as any).beginEntry()
    }));

    const [createTask] = useMutation<SubtasksCreatePostMutation>(
        graphql`
            mutation SubtasksCreatePostMutation(
                $input: PostInput!,
                $spaceId: Int,
                $connections: [ID!]!
                $reactionCount: Int
                $reactionCursor: String
                $tagCount: Int
                $tagCursor: String
            ) {
                createPost(input: $input) {
                    postEdge @appendEdge(connections: $connections) {
                        node {
                            ...PostCardFragment
                            postId
                            title
                            priority
                            dueDate
                            completed
                            deleted
                            taskTags: tags {
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

    const [putEntry] = useMutation(
        graphql`
            mutation SubtasksputEntryMutation($input: ReorderEntryInput) {
                putEntry(input: $input) {
                    id
                }
            }
        `
    )

    const {spaceID} = useParams<any>()

    const addEntry = (_location: any, _group: Group | null | undefined, entry?: Entry) => {
        const input = {
            title: '',
            spaces: [{spaceId: parseInt(spaceID), parentPostId: data.postId!!, index: data.numSubtasks, current: true}],
            type: "Task"
        }
        if (entry) {
            const attrValues = entry.attributeValues
            input.title = attrValues["Title"].value
        }
        createTask({
            variables: {
                input,
                connections: connectionIds ? connectionIds : [],
                ...defaultPostCardArgs
            },
            onCompleted: (response: any) => {
                const newPost = response.createPost?.postEdge?.node

                if (newPost) {
                    dispatch(putPost({...newPost, users: newPost.users.edges.map((e: any) => e.node)}))
                    const entryId = newPost.postId!!.toString()
                    dispatch(addEntryIds({id: currPost.postId, entryIds: [entryId], location: 'bottom'}))
                }
            }
        })
    }
    
    const deleteEntry = (entry: Entry) => {
        dispatch(removeEntryId({groupId: data.postId!!.toString(), entryId: entry.id}))
        dispatch(deletePost(entry.id))
        
        commitDeletePost({postId: parseInt(entry.id), deleteRelations: false}, connectionIds)
    }
    
    const onDragEnd = (result: DropResult) => {
        const sourceIndex = result.source.index;
        const destIndex = result.destination?.index;
        if (sourceIndex !== destIndex && destIndex !== undefined && view?.viewId) {
            const entryId = result.draggableId.split(":")[1]
            dispatch(reorderEntryIds({entryId, index: destIndex, groupId: currPost.postId.toString()}))
            putEntry({
                variables: {
                    input: {
                        viewId: view.viewId,
                        index: destIndex,
                        entryId: parseInt(entryId)
                    }
                }
            })
        }
    }
    
    return (
        <div style={{width: '100%', ...style}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 5, marginLeft: 5}}>
                <Share style={{transform: 'rotate(90deg)', marginRight: 10}}/>
                <Typography>
                    Subtasks
                </Typography>
            </div>
            <List
                canAddAttribute
                attributes={attributes}
                addEntry={addEntry}
                deleteEntry={deleteEntry}
                onDragEnd={onDragEnd}
                entryIds={entryIds ? entryIds : []}
                entryViewProps={{
                    makeSelectEntry,
                    changeAttributeValue,
                    openEntry,
                    completable: true,
                    showSubEntries: false,
                    showButton: true
                }}
                canAddEntry={!!editable}
                AddListItem={AddTaskListItem}
                AddEntry={AddSubtask}
                requireEntry
                ref={listRef}
                groupIdOverride={data?.postId?.toString()}
            />
            {
                hasNext && 
                <Button>
                    Load More
                </Button>
            }
        </div>
    )
})