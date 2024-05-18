import { AccountTree, Add, AddCircle, Close, CompareArrows, ImportExport, Loop } from '@material-ui/icons';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import React, { CSSProperties, Fragment, MouseEvent, useRef, useState } from 'react';
import { useFragment, useMutation } from 'react-relay';
import PostIconBase from '../Post/PostIconBase';
import graphql from 'babel-plugin-relay/macro';
import { GraphActionsMutation } from './__generated__/GraphActionsMutation.graphql';
import Dialog from '../Shared/Dialog';
import { DialogTitle, DialogContent, DialogActions, Snackbar, IconButton } from '@material-ui/core';
import Button from '../Shared/Button';
import TextField from '../Shared/TextField';
import { GraphActionsCreateNodeMutation } from './__generated__/GraphActionsCreateNodeMutation.graphql';
import { GraphActionsCreateLinkMutation } from './__generated__/GraphActionsCreateLinkMutation.graphql';
import { AddLink } from '@mui/icons-material';

const actions = [
    { 
        icon: <ImportExport/>, 
        name: 'Import'
    },
    { 
        icon: <AddCircle/>, 
        name: 'Add Node'
    },
    { 
        icon: <AddLink/>, 
        name: 'Add Edge'
    }
]

interface GraphActionsProps {
    style?: CSSProperties,
    space: any,
    type?: string,
    onCreateNode: (post: any) => void,
    onCreateEdge: (edge: {post1Id: number, post2Id: number}) => void,
    onImport?: () => void,
    postId?: number
}

export default function GraphActions({style, space, onImport, postId, type = 'Custom', onCreateNode, onCreateEdge}: GraphActionsProps) {
    const {spaceId} = useFragment(
        graphql`
            fragment GraphActionsFragment on Space {
                spaceId
            }
        `,
        space ? space : null
    )

    const [state, setState] = useState({
        creatingNode: false,
        creatingEdge: false,
        nodeTitle: '',
        post1: '',
        post2: '',
        message: ''
    })

    const fileRef = useRef()
    const menuAction = (e: MouseEvent, action: string) => {
        switch(action) {
            case 'Import':
                (fileRef.current as any)?.click()
                break
            case 'Add Node':
                setState({
                    ...state,
                    creatingEdge: false,
                    creatingNode: true
                })
                break
            case 'Add Edge':
                setState({
                    ...state,
                    creatingEdge: true,
                    creatingNode: false
                })
                break
        }
    }

    const [commitImportPosts] = useMutation<GraphActionsMutation>(
        graphql`
            mutation GraphActionsMutation($input: ImportPostFileInput!) {
                importPostFile(input: $input)
            }
        `
    )

    const uploadFile = (e: any) => {
        const files = e.target.files
        if (files && files.length > 0) {
            const file = files[0]
            commitImportPosts({
                variables: {
                    input: {
                        spaceId,
                        file,
                        postId
                    }
                },
                uploadables: {
                    file
                },
                onCompleted: () => onImport && onImport()
            })
        }
    }

    const [commitCreateNode] = useMutation<GraphActionsCreateNodeMutation>(
        graphql`
            mutation GraphActionsCreateNodeMutation($input: PostInput!) {
                createPost(input: $input) {
                    postEdge {
                        node {
                            id
                            postId
                            title
                            icon
                            type
                        }
                    }
                }
            }
        `
    )

    const createNode = () => {
        commitCreateNode({
            variables: {
                input: {
                    title: state.nodeTitle,
                    type,
                    spaces: [{spaceId, current: true}]
                }
            },
            onCompleted: (resp) => {
                const newPost = resp.createPost?.postEdge?.node
                newPost && onCreateNode(newPost)
            },
            onError: () => {
                setState({
                    ...state,
                    message: 'Could not create this post'
                })
            }
        })
        setState({...state, creatingNode: false, nodeTitle: ''})
    }

    const [commitCreateEdge] = useMutation<GraphActionsCreateLinkMutation>(
        graphql`
            mutation GraphActionsCreateLinkMutation($input: CreateLinkInput!) {
                createLink(input: $input) {
                    relation {
                        post1Id
                        post2Id
                    }
                }
            }
        `
    )

    const createEdge = () => {
        setState({...state, creatingEdge: false, post1: '', post2: ''})
        commitCreateEdge({
            variables: {
                input: {
                    post1Title: state.post1,
                    post2Title: state.post2,
                    spaceId
                }
            },
            onCompleted: (resp) => {
                const relation = resp.createLink?.relation
                console.log(relation)
                relation && onCreateEdge(relation as any)
            },
            onError: () => {
                setState({
                    ...state,
                    message: 'Could not find posts to relate with these names'
                })
            }
        })
    }

    const handleClose = () => {
        setState({
            ...state,
            message: ''
        })
    }

    return (
        <Fragment>
            <SpeedDial
                ariaLabel='Graph Actions'
                icon={<SpeedDialIcon/>}
                style={{...style, zIndex: 1000}}
            >
                {
                    actions.reverse().map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            tooltipOpen
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={(e) => menuAction(e, action.name)}
                        />
                    ))
                }
            </SpeedDial>
            <Dialog
                open={state.creatingNode}
                onClose={() => setState({...state, creatingNode: false})}
            >
                <DialogTitle>
                    Create Node
                </DialogTitle>
                <DialogContent>
                    <TextField
                        onChange={(e) => setState({...state, nodeTitle: e.target.value})}
                        placeholder="Node name"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({...state, creatingNode: false})}>
                        Cancel
                    </Button>
                    <Button
                        color='primary'
                        variant='contained'
                        onClick={createNode}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state.creatingEdge}
                onClose={() => setState({...state, creatingEdge: false})}
            >
                <DialogTitle>
                    Create Link
                </DialogTitle>
                <DialogContent>
                    <TextField
                        onChange={(e) => setState({...state, post1: e.target.value})}
                        placeholder="First Node Name"
                        fullWidth
                    />
                    <TextField
                        onChange={(e) => setState({...state, post2: e.target.value})}
                        placeholder="Second Node Name"
                        style={{marginTop: 15}}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({...state, creatingEdge: false})}>
                        Cancel
                    </Button>
                    <Button
                        color='primary'
                        variant='contained'
                        onClick={createEdge}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <input accept='.csv,' style={{display: 'none'}} onChange={uploadFile} type="file" ref={fileRef as any}/>
            <Snackbar
                open={state.message.length > 0}
                autoHideDuration={6000}
                onClose={handleClose}
                message={state.message}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                }
            />
        </Fragment>
    )
}
