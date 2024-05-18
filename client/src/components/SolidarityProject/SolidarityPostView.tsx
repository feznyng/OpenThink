import React, { CSSProperties, Fragment, useEffect, useMemo, useState } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useMutation, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import { SolidarityPostViewQuery } from './__generated__/SolidarityPostViewQuery.graphql';
import TextField from '../Shared/TextField';
import PostContentEditor from '../Post/PostContentEditor'
import { DialogTitle, DialogActions, DialogContent, Checkbox, IconButton, Paper, DialogContentText, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import { Add, Close, Delete, GroupAdd, Launch } from '@material-ui/icons';
import Dialog from '../Shared/Dialog'
import { getImage } from '../../actions/S3Actions';
import Typography from '../Shared/Typography';
import Button from '../Shared/Button';
import { useAppDispatch, useAppSelector } from '../../Store'
import { SolidarityPostViewAccountMutation } from './__generated__/SolidarityPostViewAccountMutation.graphql'
import { createAccount } from './PublicSlice';
import ActionItem from './ActionItem';
import PostView from '../DatabaseViews/PostView';
import { debounce } from "lodash"
import { SolidarityPostViewCreateSpaceMutation } from './__generated__/SolidarityPostViewCreateSpaceMutation.graphql';
import commitCreatePost from '../../mutations/CreatePost';
import { SolidarityPostViewCreateActionMutation } from './__generated__/SolidarityPostViewCreateActionMutation.graphql';
import { SolidarityPostViewPaginationQuery } from './__generated__/SolidarityPostViewPaginationQuery.graphql';
import { SolidarityPostViewFragment$key } from './__generated__/SolidarityPostViewFragment.graphql';
import { SolidarityPostViewDeleteActionMutation } from './__generated__/SolidarityPostViewDeleteActionMutation.graphql';
import { SolidarityPostViewCompleteMutation } from './__generated__/SolidarityPostViewCompleteMutation.graphql';
import CommentsSection from '../Comments/CommentsSection';
import GeneralTabs from '../Shared/GeneralTabs';
import { useHistory, useLocation } from 'react-router';
import { changeQueryString, queryString } from '../../utils/urlutils';
import ListItem from '../Shared/ListItem';
import { primaryColor } from '../../theme';
import ProfileLoader from '../Profile/ProfileLoader';

interface SolidarityPostViewProps {
    queryRef: any,
    style?: CSSProperties,
    onClose: () => void,
    onChange: (post: any) => void,
}

const taskMap = new Map()

const addItemProps: any = {
    button: true,
    size: "small",
    secondaryProps: {style: {color: primaryColor}},
    icon: <Add/>
}

export default function SolidarityPostView({queryRef, style, onClose, onChange}: SolidarityPostViewProps) {
    const {post, me, space} = usePreloadedQuery<SolidarityPostViewQuery>(    
        graphql`      
            query SolidarityPostViewQuery($spaceId: Int!, $postId: ID!, $userCount: Int!, $userCursor: String, $postCount: Int!, $postCursor: String) {   
                me {
                    userId
                    admin
                }
                post(postId: $postId) {
                    id
                    title
                    body
                    type
                    delta
                    ...ActionItemFragment
                    postId
                    body
                    title
                    dueDate
                    bannerpic
                    completed
                    icon
                    spaceReferencedId
                    spaceReferenced {
                        spaceId
                        description
                        name
                        ...SolidarityPostViewFragment
                    }
                }
                space(spaceId: $spaceId) {
                    permissions {
                        canEdit
                    }
                }
            }
        `,
        queryRef
    );

    const canEdit = space?.permissions?.canEdit

    const { data } = usePaginationFragment<SolidarityPostViewPaginationQuery, SolidarityPostViewFragment$key>(
        graphql`
            fragment SolidarityPostViewFragment on Space @refetchable(queryName: "SolidarityPostViewPaginationQuery") {
                posts(first: $postCount, after: $postCursor, filterTypes: ["Action"]) @connection(key: "SolidarityPostViewFragment_posts") {
                    __id
                    edges {
                        node {
                            title
                            postId
                            type
                            body
                            delta
                            ...ActionItemFragment
                        }
                    }
                }
            }
        `,
        post?.spaceReferenced ? post?.spaceReferenced : null
    )

    const connectionId = data?.posts?.__id
    const connections = connectionId && connectionId.length > 0 ? [connectionId] : []

    const {userId} = useAppSelector(state => state.public)
    const dispatch = useAppDispatch()
    const tasks = data?.posts?.edges ? data?.posts?.edges.map(({node}: any) => node) : []

    const [state, setState] = useState<any>({
        loading: false,
        name: '',
        open: false,
        postId: null,
        connectionId: '',
        running: false,
        recycle: false,
        taskMap: {},
        post: null,
        newActionName: '',
        numTasks: 0
    })

    const [currentPost, setCurrentPost] = useState<any>(null)

    useEffect(() => {
        setState({...state, loading: true});

        (!currentPost || currentPost.postId !== post?.postId) && setCurrentPost({
            title: post?.title,
            delta: post?.delta,
            postId: post?.postId,
            icon: post?.icon,
            type: post?.type
        })

        setTimeout(() => {
            setState({...state, loading: false})
        }, 100)
    }, [post?.postId])
    
    const completeAction = (postId: number, connectionId: string) => {
        if (!me?.userId && !userId) {
             // prompt user to create an account
             setState({
                ...state, 
                open: true,
                postId,
                connectionId
            })
        } else {
           complete(postId, connectionId, me?.userId ? me.userId : userId)
        }
    }

    const [commitComplete] = useMutation<SolidarityPostViewCompleteMutation>(
        graphql`
            mutation SolidarityPostViewCompleteMutation($input: MultiCompleteInput!, $connections: [ID!]!) {
                multiCompleteTask(input: $input) {
                    deletedUserId @deleteEdge(connections: $connections)
                    userEdge @appendEdge(connections: $connections) {
                        node {
                            firstname
                            lastname
                            userId
                        }
                    }
                }
            }
        `
    )

    const complete = (postId: number, connectionId: string, userId: number) => {
        commitComplete({
            variables: {
                input: {
                    postId,
                    userId: userId,
                },
                connections: [connectionId]
            },
            onCompleted: (response) => {
            }
        })
    }

    const createTempAccount = () => {
        commiteCreateTempAccount({
            variables: {
                input: {
                    name: state.name,
                    anonymous: false
                }
            },
            onCompleted: (response) => {
                const user = response.tempSignIn
                if (user) {
                    dispatch(createAccount({...user, name: state.name} as any))
                    state.postId && state.connectionId && complete(state.postId, state.connectionId, user.userId);
                    setState({
                        ...state,
                        postId: null,
                        name: '',
                        open: false
                    })
                }
            }
        })
    }


    const [commiteCreateTempAccount] = useMutation<SolidarityPostViewAccountMutation>(
        graphql`
            mutation SolidarityPostViewAccountMutation($input: TempSignInInput) {
                tempSignIn(input: $input) {
                    firstname
                    userId, 
                    lastname
                }
            }
        `
    )

  
    useEffect(() => {
        let numTasks = 0
        tasks?.forEach(({postId}) => {
            const count = taskMap.get(postId)
            numTasks += count ? count : 0
        })
    
        setState({
            ...state,
            numTasks
        })
    }, [data?.posts?.edges])

    const [commitUpdatePost] = useMutation(
        graphql`
            mutation SolidarityPostViewMutation($input: PostInput!) {
                updatePost(input: $input) {
                    postEdge {
                        node {
                            id
                        }
                    }
                }
            }
        `
    )

    const onPostChange = (post: any) => {
        setCurrentPost(post)
        commitUpdatePost({
            variables: {
                input: {postId: currentPost.postId, ...post, delta: JSON.stringify(post.delta)}
            }
        })
        onChange(post)
    }

    const [commitCreateSpace] = useMutation<SolidarityPostViewCreateSpaceMutation>(
        graphql`
            mutation SolidarityPostViewCreateSpaceMutation($input: CreateSpaceInput!, $userCount: Int!, $userCursor: String, $postCount: Int!, $postCursor: String, ) {
                createSpace(input: $input) {
                    spaceEdge {
                        node {
                            spaceId
                        }
                    }
                    referencingPost {
                        id
                        spaceReferencedId
                        spaceReferenced {
                            spaceId
                            name
                            ...SolidarityPostViewFragment
                        }
                    }
                }
            }
        `
    )

    const createGroup = () => {
        commitCreateSpace({
            variables: {
                input: {
                    type: 'Public',
                    accessType: 'Open',
                    name: post!!.title!!,
                    profilepic: post?.icon,
                    bannerpic: post?.bannerpic,
                    createdFromPostId: post?.postId 
                },
                postCount: 1000,
                userCount: 1000
            }
        })
    }

    const [commitCreateAction] = useMutation<SolidarityPostViewCreateActionMutation>(
        graphql`
            mutation SolidarityPostViewCreateActionMutation($input: PostInput!, $connections: [ID!]!, $userCount: Int!, $userCursor: String) {
                createPost(input: $input)  {
                    postEdge @prependEdge(connections: $connections) {
                        node {
                            title
                            postId
                            type
                            body
                            delta
                            ...ActionItemFragment
                        }
                    }
                }
            }
        `
    )

    const [commitDeleteAction] = useMutation<SolidarityPostViewDeleteActionMutation>(
        graphql`
            mutation SolidarityPostViewDeleteActionMutation($input: DeletePostInput!, $connections: [ID!]!) {
                deletePost(input: $input)  {
                    deletedPostId @deleteEdge(connections: $connections)
                }
            }
        `
    )

    const createItem = (spaceId: number) => {
        setState({
            ...state,
            newActionName: '',
            creating: false,
        })
        commitCreateAction({
            variables: {
                input: {
                    type: 'Action',
                    title: state.newActionName,
                    spaces: [{spaceId, current: true}],
                    delta: JSON.stringify(state.content)
                },
                userCount: 10000,
                connections: connectionId ? [connectionId] : []
            }
        })
       
    }

    const createSolidarityAction = () => {
        if (post?.spaceReferencedId) {
            createItem(post?.spaceReferencedId)
        } else {
            commitCreateSpace({
                variables: {
                    input: {
                        type: 'Public',
                        accessType: 'Open',
                        name: post!!.title!!,
                        profilepic: post?.icon,
                        bannerpic: post?.bannerpic,
                        createdFromPostId: post?.postId 
                    },
                    postCount: 1000,
                    userCount: 1000
                },
                onCompleted: (response) => {
                    const spaceId = response.createSpace?.spaceEdge?.node?.spaceId
                    spaceId && createItem(spaceId)
                }
            })
        }
    }

    const history = useHistory()
    const location = useLocation()
    let { tab } = queryString.parse(location.search)

    tab = tab ? (tab as string) : 'actions'

    return (
        <div style={{...style, paddingLeft: 15, paddingRight: 15}}>
            <div style={{height: 20}}>
                <div style={{position: 'absolute', boxShadow: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, top: 0, left: 0, paddingLeft: 15, paddingTop: 15, paddingBottom: 15, zIndex: 1000, paddingRight: 15, width: '100%'}}>
                    <IconButton 
                        size='small' 
                        style={{marginRight: 15}}
                        onClick={onClose}
                    >
                        <Close/>
                    </IconButton>
                </div>
            </div>
            {
                <Fragment>
                    {
                        currentPost && currentPost.postId.toString() === queryRef.variables.postId.toString() ? 
                        <PostView
                            title={currentPost?.title ? currentPost.title : ''}
                            content={post?.delta}
                            icon={currentPost?.icon}
                            onTitleChange={(title) => onPostChange({...currentPost, title})}
                            onContentChange={(delta) => onPostChange({...currentPost, delta})}
                            onIconChange={(icon) => onPostChange({...currentPost, icon})}
                            contentProps={{
                                placeholder: 'Add a description...',
                                showEditButtons: true,
                                variant: 'focusOutlined'
                            }}
                            readonly={!canEdit}
                        />
                        :
                        <ProfileLoader/>
                    }
                    <div>
                        <GeneralTabs
                            tabs={['Actions', 'Events', 'Projects'].map(title => ({title, value: title.toLocaleLowerCase()}))}
                            selected={tab}
                            onClick={(link) => history.replace(location.pathname + '?' + changeQueryString('tab', link))}
                        />

                        <Divider
                            style={{marginBottom: 10}}
                        />
                        {
                            tab === 'actions' &&
                            <div style={{marginTop: 15}}>
                                <ListItem
                                    primary={'Add Solidarity Action'}
                                    secondary='Coming Soon!'
                                    {...addItemProps}
                                />
                            </div>
                        }
                        {
                            tab === 'events' &&
                            <div style={{marginTop: 15}}>
                                <ListItem
                                    primary={'Add Event'}
                                    secondary='Coming Soon!'
                                    {...addItemProps}
                                />
                            </div>
                        }
                        {
                            tab === 'projects' &&
                            <div style={{marginTop: 15}}>
                                <ListItem
                                    primary={'Add Projects'}
                                    secondary='Coming Soon!'
                                    {...addItemProps}
                                />
                            </div>
                        }
                    </div>

                    <Dialog
                        open={state.open}
                        onClose={() => setState({...state, open: false})}
                    >
                        <DialogTitle>
                            Complete Action Item
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Please enter your name to continue.
                            </DialogContentText>
                            <TextField
                                onChange={e => setState({...state, name: e.target.value})}
                                value={state.name}
                                fullWidth
                                placeholder='Name'
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setState({...state, open: false})}>
                                Done
                            </Button>
                            <Button 
                                color="primary" 
                                variant="contained" 
                                onClick={createTempAccount}
                                disabled={state.name.length === 0}
                            >
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <div>
                        {
                            /*
                                <CommentsSection
                                    postId={post.postId!!}
                                    style={{marginTop: 15, paddingBottom: 10,}}
                                />


                                <Typography style={{marginBottom: 10, fontWeight: 'bold'}}>
                                    Solidarity Actions {'\u2022'} {state.numTasks} Taken
                                </Typography>
                                <Divider/>

                                {
                                    <Fragment>
                                        {
                                            state.creating ?
                                            <div>
                                                <TextField
                                                    fullWidth
                                                    autoFocus
                                                    label="Enter Action Name"
                                                    value={state.newActionName}
                                                    onChange={e => setState({...state, newActionName: e.target.value})}
                                                />
                                                <PostContentEditor
                                                    onChange={(content) => setState({...state, content})}
                                                    placeholder='Add a description'
                                                    style={{marginTop: 10}}
                                                />
                                                <div style={{display: 'flex', alignItems: 'center', marginTop: 15,}}>
                                                    <Button
                                                        onClick={() => setState({...state, creating: false,})}
                                                        size="small"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        color='primary'
                                                        variant="contained"
                                                        onClick={() => createSolidarityAction()}
                                                        size="small"
                                                    >
                                                        Create
                                                    </Button>
                                                </div>
                                            </div>
                                            :
                                            <ListItem
                                                button
                                                onClick={() => setState({...state, creating: true})}
                                                style={{paddingLeft: 8}}
                                            >
                                                <ListItemIcon>
                                                    <Add/>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Add Solidarity Action"
                                                />
                                            </ListItem>
                                        }
                                    </Fragment>
                                }
                                {
                                    tasks?.map((post: any) => (
                                        <ActionItem
                                            post={post}
                                            complete={completeAction}
                                            userId={me?.userId ? me?.userId : userId}
                                            reportCount={(postId, count) => {
                                                taskMap.set(postId, count)
                                            }}
                                            onDelete={() => {
                                                commitDeleteAction({
                                                    variables: {
                                                        input: {
                                                            postId: post.postId,
                                                            deleteRelations: false,
                                                        },
                                                        connections
                                                    }
                                                })
                                            }}
                                        />
                                    ))
                                }
                            */
                        }
                    </div>
                </Fragment>
            }
        </div>
    )
}