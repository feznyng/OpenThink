import React, { CSSProperties, ReactElement, Suspense, useEffect } from 'react'
import { CircularProgress, DialogActions, DialogContent, DialogContentText, IconButtonProps, ListItemIcon, ListItemText, MenuItem } from '@material-ui/core'
import { useFragment, useLazyLoadQuery, useMutation } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Delete, Edit, Notifications, NotificationsActive } from '@material-ui/icons';
import PinIcon from '../Shared/PinIcon';
import commitDeletePost from '../../mutations/DeletePost';
import Button from '../Shared/Button';
import Dialog from '../Shared/Dialog';
import { useAppDispatch } from '../../Store';
import { removeEntryId } from '../Task/TaskSlice';
import { PostLocation } from './PostCard';
import { DialogTitle } from '@mui/material';
import { PostMoreActionsPinSpaceMutation } from './__generated__/PostMoreActionsPinSpaceMutation.graphql';
import { PostMoreActionsPinRelatedMutation } from './__generated__/PostMoreActionsPinRelatedMutation.graphql';
import { PostMoreActionsQuery } from './__generated__/PostMoreActionsQuery.graphql';
import { Anchor } from './PostContentEditor';
import { useParams } from 'react-router';
import { PostMoreActionsSubscribeMutation } from './__generated__/PostMoreActionsSubscribeMutation.graphql';
import { DriveFileMove } from '@mui/icons-material';
import MovePostMenu from './MovePostMenu';
import { PostMoreActionsMoveMutation } from './__generated__/PostMoreActionsMoveMutation.graphql';

const shortcutMap: {[key: string]: string} = {
    'e': 'Edit',
    'p': 'Pin',
    's': 'Subscribe',
    'm': 'Move',
    'd': 'Delete'
}
export interface PostMoreActionsProps {
    post: any,
    connectionId?: string,
    parentPostId?: number | null,
    location?: PostLocation,
    onClose: () => void,
    onEdit?: (post: any) => void,
    onDelete?: (postId: number) => void,
}

interface PostMoreActionsState {
    editing: boolean,
    deleting?: boolean,
    key: boolean,
    menuItems: {name: string, icon: ReactElement, desc?: string, style?: CSSProperties}[],
    anchorEl: Anchor,
    moving: boolean,
    parentPostId: number | null
}

export default function PostMoreActions({post, connectionId, parentPostId, onDelete, location, onEdit, onClose, ...props}: PostMoreActionsProps & Partial<IconButtonProps>) {
    const {parentRelation, postId, spacePost, subscription, createdBy, ...data} = useFragment(
        graphql`
            fragment PostMoreActionsFragment on Post {
                postId
                ...PostGraphNodeFragment @relay(mask: false)
                parentRelation {
                    post1Id
                    relationId
                    pinned
                }
                spacePost(spaceId: $spaceId) {
                    spaceId
                    spacePostId
                    pinned
                }
                createdBy
                subscription {
                    id
                    postSubscriptionId
                }
            }
        `,
        post
    )
    
    const { spaceID } = useParams<any>()

    const spaceId = spaceID ? parseInt(spaceID) : spacePost?.spaceId
    const {me, space} = useLazyLoadQuery<PostMoreActionsQuery>(
        graphql`
            query PostMoreActionsQuery($spaceId: Int!, $hasSpace: Boolean!) {
                me {
                    userId
                }
                space(spaceId: $spaceId) @include(if: $hasSpace) {
                    permissions {
                        canEditAnyPost
                        canPinPosts
                        canDeletePosts
                    }
                }
            }
        `,
        {spaceId, hasSpace: !!spaceId}
    )

    const dispatch = useAppDispatch()

    const [state, setState] = React.useState<PostMoreActionsState>({
        editing: false,
        moving: false,
        key: true,
        menuItems: [],
        anchorEl: null,
        parentPostId: parentRelation?.post1Id
    })

    const onDeletePost = () => {
        setState({...state, deleting: true, anchorEl: null})
    }

    const [commitPinSpacePost] = useMutation<PostMoreActionsPinSpaceMutation>(
        graphql`
            mutation PostMoreActionsPinSpaceMutation($input: PinSpacePostInput!) {
                pinSpacePost(input: $input) {
                    id
                    pinned
                }
            }
        `
    )

    const [commitPinRelatedPost] = useMutation<PostMoreActionsPinRelatedMutation>(
        graphql`
            mutation PostMoreActionsPinRelatedMutation($input: PinRelatedPostInput!) {
                pinRelatedPost(input: $input) {
                    id
                    pinned
                }
            }
        `
    )

    const [commitSubscribePost] = useMutation<PostMoreActionsSubscribeMutation>(
        graphql`
            mutation PostMoreActionsSubscribeMutation($input: SubscribePostInput!) {
                subscribePost(input: $input) {
                    id
                    postSubscriptionId
                }
            }
        `
    )

    const [commitUnsubscribePost] = useMutation<PostMoreActionsSubscribeMutation>(
        graphql`
            mutation PostMoreActionsUnsubscribeMutation($input: SubscribePostInput!) {
                unsubscribePost(input: $input) {
                    id
                    postSubscriptionId
                }
            }
        `
    )

    const [commitMovePost, moveInFlight] = useMutation<PostMoreActionsMoveMutation>(
        graphql`
            mutation PostMoreActionsMoveMutation($input: MovePostInput!, $connections: [ID!]!) {
                movePost(input: $input) {
                    deletedPostId @deleteEdge(connections: $connections)
                    newParentPostId
                    prevParentPostId
                }
            }
        `
    )

    const pinPost = () => {
        if (location === 'subposts' && parentRelation?.relationId) { // pin to subpost list
            commitPinRelatedPost({
                variables: {
                    input: {
                        relationId: parentRelation.relationId,
                        pinned: !parentRelation.pinned
                    }
                }
            })
        } else if (location === 'space' && spacePost && spacePost.spacePostId) { // pin to space
            commitPinSpacePost({
                variables: {
                    input: {
                        spacePostId: spacePost.spacePostId,
                        pinned: !spacePost.pinned
                    }
                }
            })
        }
    }

    const deletePost = () => {

        commitDeletePost({postId}, connectionId ? [connectionId] : [])
        parentPostId && dispatch(removeEntryId({groupId: parentPostId.toString(), entryId: postId.toString()}))
        setState({
            ...state,
            deleting: false
        })
        onClose()
        onDelete && onDelete(postId)
    }

    const toggleSubscription = () => {
        subscription?.postSubscriptionId ? commitUnsubscribePost({
            variables: {
                input: {
                    postId
                }
            }
        }) : commitSubscribePost({
            variables: {
                input: {
                    postId
                }
            }
        })
    }

    const menuAction = (action: string) => {
        switch(action) {
            case 'Pin':
                pinPost()
                break
            case 'Unpin':
                pinPost()
                break
            case 'Subscribe':
                toggleSubscription()
                break
            case 'Unsubscribe':
                toggleSubscription()
                break
            case 'Edit':
                onEdit && onEdit({postId, ...data})
                break
            case 'Move':
                setState({
                    ...state,
                    moving: true,
                })
                break
            case 'Delete':
                onDeletePost()
                break
        }
    }
    
    const pinned = spacePost?.pinned || parentRelation?.pinned

    useEffect(() => {
        const menuItems = []
        if (space?.permissions?.canPinPosts) {
            menuItems.push(
                {
                    name: pinned ? 'Unpin' : 'Pin',
                    icon: <PinIcon/>,
                },
            )
        }

        if (onEdit && (me?.userId === createdBy || space?.permissions?.canEditAnyPost)) {
            menuItems.push(
                {
                    name: 'Edit',
                    icon: <Edit/>,
                },
            )
        }
        
        menuItems.push({
            name: subscription?.postSubscriptionId ? 'Unsubscribe' : 'Subscribe',
            icon: subscription?.postSubscriptionId ? <NotificationsActive/> : <Notifications/>,
            desc: pinned ? `Stop receiving updates` : `Get updates on activity`
        })

        menuItems.push(
            {
                name: 'Move',
                icon: <DriveFileMove/>,
            }
        )

        if (me?.userId === createdBy || space?.permissions?.canDeletePosts) {
            menuItems.push(
                {
                    name: 'Delete',
                    icon: <Delete style={{color: 'red'}}/>,
                    style: {color: 'red'}
                }
            )
        }
        setState({
            ...state,
            menuItems
        })

        const shortcutListener = (e: KeyboardEvent) => {
            console.log(state.deleting, e.key)
            if (state.deleting) {
                e.key === 'Enter' && deletePost()
            } else {
                menuAction(shortcutMap[e.key] as string)
            }
        }

        document.addEventListener('keydown', shortcutListener)

        return () => document.removeEventListener('keydown', shortcutListener)
    }, [space?.permissions, subscription?.postSubscriptionId, me?.userId, spacePost?.pinned, state.deleting])
    
    const movePost = () => {
        commitMovePost({
            variables: {
                input: {
                    existingRelationId: parentRelation?.relationId,
                    postId,
                    newParentPostId: state.parentPostId,
                    spaceId
                },
                connections: connectionId ? [connectionId] : []
            },
            updater: (store, data) => {
                const newParentPostId = data.movePost?.newParentPostId
                const prevParentPostId = data.movePost?.prevParentPostId
                if (state.parentPostId && newParentPostId) {
                    const parentPost = store.get(newParentPostId)
                    const numRelations = parentPost?.getValue('numPosts') as number
                    parentPost?.setValue((numRelations ? numRelations : 0) + 1, 'numPosts')
                }
                if (prevParentPostId) {
                    const parentPost = store.get(prevParentPostId)
                    const numRelations = parentPost?.getValue('numPosts') as number
                    parentPost?.setValue((numRelations ? numRelations : 0) - 1, 'numPosts')
                }
            },
            onCompleted: onClose
        })
        
    }

    return (
        <React.Fragment>
            {
                state.menuItems.map(({name, desc, icon, style}) => (
                    <MenuItem onClick={() => menuAction(name)} style={style}>
                        <ListItemIcon>
                            {icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={name}
                            secondary={desc}
                        />
                    </MenuItem>
                ))
            }
            <Dialog
                open={!!state.deleting}
                onClose={() => setState({...state, deleting: false})}
            >
                <DialogTitle>
                    Delete Post
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this post?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={deletePost}
                        startIcon={<Delete/>}
                        style={{color: 'white', backgroundColor: 'red'}}
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={!!state.moving}
                onClose={() => setState({...state, moving: false})}
            >
                <DialogTitle>
                    Move Post
                </DialogTitle>
                <DialogContent
                    style={{width: 550, height: 500}}
                    id="scrollableDiv"
                >
                    <Suspense
                        fallback={
                            <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
                                <CircularProgress/>
                            </div>
                        }
                    >
                       <MovePostMenu
                            postId={postId}
                            spaceId={spaceId}
                            parentPostId={state.parentPostId ? state.parentPostId.toString() : null}
                            onChangeParent={(parentPostId) => setState({
                                ...state,
                                parentPostId
                            })}
                        />
                    </Suspense>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={movePost}
                        startIcon={<DriveFileMove/>}
                        variant="contained"
                        color="primary"
                        loading={moveInFlight}
                    >
                        Move
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
