import React, { useEffect, useState } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useMutation, usePaginationFragment } from 'react-relay';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, ListItemIcon, ListItemText } from '@material-ui/core';
import { SolidaritySidebarQuery } from './__generated__/SolidaritySidebarQuery.graphql';
import { SolidaritySidebarFragment$key } from './__generated__/SolidaritySidebarFragment.graphql';
import PostListItem from '../Post/PostListItem';
import { useHistory, useParams } from 'react-router';
import { SpaceViewParams } from '../../types/router';
import { Add, Delete, Edit } from '@material-ui/icons';
import TextField from '../Shared/TextField';
import Button from '../Shared/Button';
import { SolidaritySidebarCreateMutation } from './__generated__/SolidaritySidebarCreateMutation.graphql';
import { SolidaritySidebarDeleteMutation } from './__generated__/SolidaritySidebarDeleteMutation.graphql';
import { SolidaritySidebarCreateViewMutation } from './__generated__/SolidaritySidebarCreateViewMutation.graphql';
import ListItem from '../Shared/ListItem';
import Typography from '../Shared/Typography';

interface SolidaritySidebarProps {
    project: any
}

interface SolidaritySidebarState {
    creating: boolean,
    title: string,
    editing: null | number,
    renameTo: string,
    deleting: null | number,
}

export default function SolidaritySidebar({ project }: SolidaritySidebarProps) {
    const { data, loadNext, hasNext } = usePaginationFragment<SolidaritySidebarQuery, SolidaritySidebarFragment$key>(
        graphql`
            fragment SolidaritySidebarFragment on Space @refetchable(queryName: "SolidaritySidebarQuery") {
                spaceId
                posts(first: $mapCount, after: $mapCursor, filterTypes: ["Database"]) @connection(key: "SolidaritySidebarFragment_posts") {
                    __id
                    edges {
                        node {
                            postId
                            ...PostListItemFragment
                        }
                    }
                }
                permissions {
                    canPost
                }
            }
        `,
        project
    )
    const connectionId = data.posts?.__id
    const canAddMap = data?.permissions?.canPost?.includes('Database')

    const { spacePage, spaceID } = useParams<SpaceViewParams>()
    const [state, setState] = useState<SolidaritySidebarState>({
        creating: false,
        title: '',
        editing: null,
        renameTo: '',
        deleting: null
    })
    const history = useHistory()

    useEffect(() => {
        if (!spacePage && data.posts?.edges && data.posts.edges.length > 0 && data.posts.edges[0]?.node) {
            history.replace(`/space/${spaceID}/${data.posts.edges[0]?.node.postId}`)
        }
    }, [spacePage])

    const [commitCreateMap] = useMutation<SolidaritySidebarCreateMutation>(
        graphql`
            mutation SolidaritySidebarCreateMutation($input: PostInput!, $connections: [ID!]!) {
                createPost(input: $input) {
                    postEdge @appendEdge(connections: $connections) {
                        node {
                            postId
                            ...PostListItemFragment
                        }
                    }
                }
            }
        `
    )

    const [commitCreateView] = useMutation<SolidaritySidebarCreateViewMutation>(
        graphql`
            mutation SolidaritySidebarCreateViewMutation($input: CreateViewInput!, $connections: [ID!]!) {
                createView(input: $input) {
                    view @appendEdge(connections: $connections) {
                        node {
                            name
                            viewId
                        }
                    }
                }
            }
        `
    )

    const createMap = () => {
        commitCreateMap({
            variables: {
                input: {
                    title: state.title,
                    type: 'Database',
                    spaces: [{spaceId: parseInt(spaceID), current: true}]
                },
                connections: connectionId ? [connectionId] : []
            },
            onCompleted: (resp) => {
                setState({
                    ...state,
                    creating: false,
                    title: ''
                })
                const mapId = resp.createPost?.postEdge?.node?.postId
                commitCreateView({
                    variables: {
                        input: {
                            postId: resp.createPost?.postEdge?.node?.postId,
                            name: 'Default',
                            type: 'Graph',
                            spaceId: parseInt(spaceID),
                            defaultView: true
                        },
                        connections: []
                    },
                    onCompleted: (resp) => history.replace(`/space/${spaceID}/${mapId}`)
                })
            }
        })
    }

    const onMenu = (postId: number, action: string) => {
        switch(action) {
            case 'Delete':
                setState({
                    ...state,
                    deleting: postId
                })
                break
            case 'Edit':
                setState({
                    ...state,
                    editing: postId,
                    renameTo: ''
                })
                break
        }
    }

    const [commitDeleteMap] = useMutation<SolidaritySidebarDeleteMutation>(
        graphql`
            mutation SolidaritySidebarDeleteMutation($input: DeletePostInput!, $connections: [ID!]!) {
                deletePost(input: $input) {
                    deletedPostId @deleteEdge(connections: $connections)
                       
                }
            }
        `
    )

    const deleteMap = () => {
        setState({
            ...state,
            deleting: null,
        })
        commitDeleteMap({
            variables: {
                input: {
                    postId: state.deleting!!,
                    deleteRelations: false
                },
                connections: connectionId ? [connectionId] : [],
            },
            onCompleted: () => (data.posts?.edges && data.posts.edges.length > 0) ? 
            history.replace(`/space/${spaceID}/${data.posts.edges[0]!!.node?.postId}`) : history.replace(`/space/${spaceID}`)
        })
    }

    return (
        <div>
            <InfiniteScroll
                next={() => loadNext(10)}
                hasMore={hasNext}
                loader={<CircularProgress/>}
                dataLength={data?.posts?.edges ? data.posts.edges.length : 0}
            >
                {
                    data?.posts?.edges?.map(e => (
                        <PostListItem
                            selected={e?.node?.postId === parseInt(spacePage)}
                            post={e!!.node}
                            onClick={(postId) => history.replace(`/space/${data.spaceId}/${postId}`)}
                            menuOptions={canAddMap ? [
                                {name: 'Delete', icon: <Delete style={{color: 'red'}}/>},
                            ] : []}
                            onMenu={(action) => e?.node?.postId && onMenu(e.node.postId, action)}
                            style={{marginBottom: 2}}
                        />
                    ))
                }
                {
                    canAddMap && 
                    <div>
                        {
                            state.creating ?
                            <div style={{paddingLeft: 10, paddingRight: 10, marginTop: 10}}>
                                <TextField
                                    value={state.title}
                                    onChange={e => setState({...state, title: e.target.value})}
                                    fullWidth
                                    size="small"
                                    placeholder='Map Name'
                                    label='Name'
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && createMap()}
                                />
                                <div style={{display: 'flex', float: 'right'}}>
                                    <Button
                                        style={{marginRight: 5}}
                                        onClick={() => setState({...state, creating: false})}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        startIcon={<Add/>}
                                        color="primary"
                                        onClick={createMap}
                                    >
                                        Create
                                    </Button>
                                </div>
                            </div>
                            :
                            <ListItem
                                button
                                onClick={() => setState({...state, creating: true})}
                                size="small"
                                icon={<Add fontSize='small'/>}
                                primary='Create'
                            />
                        }
                    </div>
                }
                
            </InfiniteScroll>

            <Dialog
                open={!!state.deleting}
                onClose={() => setState({...state, deleting: null})}
            >
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this map?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({...state, deleting: null})}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={deleteMap}
                        style={{backgroundColor: 'red', color: 'white'}}
                        variant='contained'
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
