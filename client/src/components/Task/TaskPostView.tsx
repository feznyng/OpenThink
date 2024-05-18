import React, { useRef } from 'react'
import graphql from 'babel-plugin-relay/macro';
import {usePreloadedQuery} from 'react-relay';
import TaskPostActions from './TaskPostActions';
import { Divider } from '@material-ui/core';
import Subtasks from './Subtasks';
import TextField from '../Shared/TextField';
import { TaskPostViewQuery } from './__generated__/TaskPostViewQuery.graphql';
import PostContentEditor from '../Post/PostContentEditor';
import { useAppDispatch, useAppSelector } from '../../Store';
import { putPost } from './TaskSlice';
import CompleteButtonBase from './CompleteButtonBase';
import { useHistory } from 'react-router';
import { Entry } from '../../types/database';
import { priorities, translatePriorityNum } from '../../utils/taskutils';
import AttributeTable from '../Attributes/AttributeTable';
import PostView from '../DatabaseViews/PostView';

export interface TaskPostViewProps {
    queryRef: any,
    style?: React.CSSProperties,
    onClose: () => void,
    onChange: (post: any) => void,
    changeAttributeValue: (entryId: string, name: string, value: any, groupId?: string | null) => void,
    openEntry: (entry: Entry) => void,
    spaceId?: number,
    view: string,
    editable?: boolean
}

const menuHeight = 50;
const postPadding = 30;

export default function TaskPostView({queryRef, style, spaceId, view, editable, openEntry, changeAttributeValue, onChange, onClose}: TaskPostViewProps) {
    const {post} = usePreloadedQuery<TaskPostViewQuery>(    
        graphql`      
            query TaskPostViewQuery($postId: ID!, $taskCount: Int!, $taskCursor: String, $spaceId: Int!) {   
                post(postId: $postId) {
                    postId
                    title
                    body
                    delta
                    postId
                    title
                    dueDate
                    completed
                    author {
                        firstname
                        profilepic
                        lastname
                    }
                    parent: path(first: 1, reverse: true, spaceId: $spaceId) {
                        edges {
                            node {
                                postId
                            }
                        }
                    }
                    ...SubtasksFragment
                }
            }
        `,
        queryRef
    );

    const parent = post?.parent?.edges && post.parent.edges.length > 0 ? post?.parent?.edges[0]!!.node : null
    const postId = post!!.postId!!
    const task = useAppSelector(state => state.task.tasks[postId])

    const [state, setState] = React.useState({
        loaded: false,
    })
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        setState({...state, loaded: false})
        if (post) {
            setTimeout(() => {
                console.log('loaded')
                setState({...state, loaded: true})
            }, 20)
            dispatch(putPost(post!!))
        }
    }, [postId])


    const subtaskRef = useRef()

    const onPostChange = (change: object) => {
        onChange({postId: task.postId, ...change})
    }

    const onTitleChange = (title: string) => {
        onPostChange({title})
    }

    const onContentChange = (delta: any) => {
        onPostChange({delta})
    }


    const {priority, dueDate, users, tags} = useAppSelector(state => state.task.tasks[postId.toString()])
    const translatedPriority = translatePriorityNum(priority)
    const attributes = [
        {
            name: 'Due date',
            type: 'Date', 
        },
        {
            name: 'Assignees',
            type: 'Person', 
        },
        {
            name: 'Priority',
            type: 'Select',
            options: priorities,
        },
        {
            name: 'Tags',
            type: 'Tags',
            value: [],
        },
    ]

    const attributeValues = {
        'Due date': {
            value: dueDate,
            type: 'Date'
        },
        'Assignees': {
            value: users,
            type: 'Person'
        },
        'Priority': {
            value: translatedPriority,
            type: 'Select'
        },
        'Tags': {
            value: tags,
            type: 'Tags'
        },
        
    }

    return (
        <div style={style}>
            {
                task && post &&
                <div>
                    <div
                        style={{height: menuHeight, paddingRight: postPadding, paddingLeft: postPadding}}
                    >
                        <div
                            style={{float: 'left', marginLeft: -5, display: 'flex', height: '100%', alignItems: 'center'}}
                        >
                            <CompleteButtonBase
                                completed={!!task?.completed}
                                onClick={() => changeAttributeValue(post.postId!!.toString(), 'Completed', !task?.completed, parent?.postId?.toString())}
                            />
                        </div>
                        <div
                            style={{float: 'right', height: '100%', display: 'flex', alignItems: 'center'}}
                        >
                            <TaskPostActions
                                onClose={onClose}
                                data={post}
                                createSubtask={() => (subtaskRef.current as any).openSubtaskCreator()}
                            />
                        </div>
                    </div>
                    <Divider/>
                    <div
                        style={{paddingRight: postPadding, paddingLeft: postPadding, marginTop: 15}}
                    >
                        <PostView
                            content={post.delta}
                            title={post.title ? post.title : ''}
                            onContentChange={onContentChange}
                            onTitleChange={(title) => onTitleChange(title)}
                            attributes={attributes}
                            hideImageButtons
                            attributeValues={attributeValues}
                            onAttributeChange={(name, value) => changeAttributeValue(postId.toString(), name, value)}
                            contentLoaded={state.loaded}
                            titleProps={{
                                placeholder: 'Title',
                                InputProps: {
                                    style: {fontSize: 25}
                                },
                                size: 'small',
                                variant: 'focusOutlined',
                                style: {marginLeft: -12}
                            }}
                            contentProps={{
                                variant: 'focusOutlined',
                                placeholder: 'Add more detail to this task',
                                style: {minHeight: 100, marginLeft: -6}
                            }}
                        />
                        <Subtasks
                            post={post}
                            ref={subtaskRef}
                            openEntry={openEntry}
                            editable={editable}
                            style={{marginTop: 10}}
                        />
                        <div style={{height: 20}}/>
                    </div>
               
                </div>
            }
        </div>
    )
}
