import React, { useEffect, useMemo, useState } from 'react'
import { useLazyLoadQuery, usePreloadedQuery, useQueryLoader } from 'react-relay'
import GraphView, { GraphViewProps, Edge, Node } from '../DatabaseViews/GraphView'
import PostDrawerLayout from '../Layouts/PostDrawerLayout'
import graphql from 'babel-plugin-relay/macro';
import { PostGraphQuery } from './__generated__/PostGraphQuery.graphql';
import { modifySvg } from '../../utils/imageutils';
import { getPostColor, getPostIconSvg } from '../../utils/postutils';
import { IconButton, Paper, useTheme } from '@material-ui/core';
import PostView from '../Post/PostView';
import SuspenseLoader from '../Shared/SuspenseLoader';
import PostViewQuery from '../Post/__generated__/PostViewQuery.graphql'
import { ChevronRight, Close } from '@material-ui/icons';
import ProfileLoader from '../Profile/ProfileLoader'
import { getImage } from '../../actions/S3Actions';

const postNodeFragment = graphql`
    fragment PostGraphNodeFragment on Post {
        postId
        title
        type
    }
`

const postTreeFragment = graphql`
    fragment PostGraphFragment on HasPosts {
        posts(first: 1000) {
            edges {
                node {
                    ...PostGraphNodeFragment @relay(mask: false)
                    posts(first: 1000) {
                        edges {
                            node {
                                ...PostGraphNodeFragment @relay(mask: false)
                                posts(first: 1000) {
                                    edges {
                                        node {
                                            ...PostGraphNodeFragment @relay(mask: false)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`

export interface PostNode {
    postId: number,
    title: string,
    type: string,
    root?: boolean,
    icon?: string,
    posts: {
        edges: {
            node: PostNode
         }[]
    },
    attributeValues?: {
        attributeId: number,
        textValue: string
    }[]
}

interface PostToNodeOptions {
    omitImage?: boolean,
    rootId?: number
}

export function postToNode({postId, icon, title, type, attributeValues}: Omit<PostNode, 'posts'>, {omitImage, rootId}: PostToNodeOptions = {}) {
    let image: HTMLImageElement | null = new Image()

    if (icon) {
        image.src = getImage(icon) 
    } else if (!omitImage) {
        modifySvg(image, getPostIconSvg(type), {fill: getPostColor(type)})
    } else {
        image = null
    }

    return {
        id: postId.toString(),
        label: title,
        type,
        root: postId === rootId,
        image,
        alt: icon,
        attributes: attributeValues ? attributeValues
        .map(attr => {
            const numeric = parseInt(attr.textValue)

            return {
                ...attr, 
                value: attr.textValue.toUpperCase() === 'TRUE' || numeric > 0, 
                attributeId: attr.attributeId.toString()
            }
        })
        .filter(({value}) => value) : []
    }
}

interface PostGraphProps {
    postId?: number | null, // the post we're fetching graph data for (only one of these should be provided)
    spaceId?: number | null, // the space we're fetching graph data for 
    viewId?: number // the post we're currently viewing
    openPost: (postId: number) => void, // open a post using its id
    closePost: () => void, // close the current post,
    graphViewProps?: Partial<GraphViewProps> // pass filter, sort, etc. config to graph directly
    exit: () => void
    diffFilters?: boolean
}

export default function PostGraph({postId, spaceId, viewId, exit, openPost, closePost, diffFilters}: PostGraphProps) {
    const { postGraph } = useLazyLoadQuery<PostGraphQuery>(
        graphql`
            query PostGraphQuery($postId: Int!, $fetchPost: Boolean!) {
                postGraph(postId: $postId) @include(if: $fetchPost) {
                    nodes {
                        ...PostIconFragment
                        ...PostGraphNodeFragment @relay(mask: false)
                    }
                    edges {
                        post1Id
                        post2Id
                    }
                }
            }
        `,
        {postId: postId!!, fetchPost: !!postId},
        {fetchPolicy: 'network-only'}
    )

    const generateNode = (node: Omit<PostNode, 'posts'>) => postId ? postToNode(node, {rootId: postId}) : postToNode(node,  {rootId: spaceId!!})
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'
    const [changed, setChanged] = useState(false)

    const {nodes, links, nodeMap} = useMemo(() => {
        let nodes: Node[] = []
        let links: Edge[] = []
        const nodeMap = new Map()
        if (postGraph && postId) {
            nodes = postGraph.nodes ? postGraph.nodes.map(post => generateNode(post as any)) : []
            links = postGraph.edges ? postGraph.edges.map(({post1Id, post2Id}: any) => ({source: post1Id.toString(), target: post2Id.toString()})) : []
        }
        return {nodes, links, nodeMap}
    }, [])

    const [postQueryRef, loadPost] = useQueryLoader(PostViewQuery)

    useEffect(() => {
        if (viewId) {
            loadPost({postId: viewId, spaceId, postCount: 20, tagCount: 30, reactionCount: 30, taskCount: 10, pathCount: 10, sortBy: 'New'}, {fetchPolicy: 'store-and-network'})
        }
    }, [viewId])

    const modifyNode = (post: any) => {
        const existingPost = nodeMap.get(post.postId)
        if (existingPost) {
            const existingNode = generateNode(post)
            existingPost.label = existingNode.label
            existingPost.image = existingNode.image
            return true
        } else {
            return false
        }
    }

    const deleteNode = (postId: number) => {
        if (nodeMap.has(postId)) {
            const node = nodeMap.get(postId)
            nodeMap.delete(postId)
            const index = nodes.indexOf(node)
            nodes.splice(index, 1)
            links.forEach(({target}, i) => {
                (target === postId.toString() || (target as any).id === postId.toString()) && links.splice(i, 1)
            })
        }
        setChanged(!changed)
    }

    return (
        <PostDrawerLayout
            open={!!viewId}
            main={
                <GraphView
                    nodes={nodes}
                    links={links}
                    linkColor={darkMode ? 'grey' : '#393939'}
                    onNodeClick={({id}) => openPost(parseInt(id))}
                />
            }
            postView={
                <SuspenseLoader
                    queryRef={postQueryRef}
                    fallback={<ProfileLoader/>} 
                >
                    <div style={{zIndex: 1000}}>
                        <div style={{height: 50}}>
                            <Paper style={{position: 'absolute', height: 50, boxShadow: 'none', borderRadius: 0, top: 0, left: 0, paddingLeft: 15, paddingTop: 10, paddingBottom: 15, zIndex: 1000, paddingRight: 15, width: '100%'}}>
                                <IconButton 
                                    size="small" 
                                    style={{marginLeft: -8}}
                                    onClick={closePost}
                                >
                                    <ChevronRight/>
                                </IconButton>
                                <IconButton size="small" style={{float: 'right'}} onClick={exit}>
                                    <Close/>
                                </IconButton>
                            </Paper>
                        </div>
                        <PostView
                            queryRef={postQueryRef}
                            postMainProps={{
                                postMoreActionsProps: {
                                    onDelete: (postId) => {
                                        deleteNode(postId) 
                                        closePost()
                                    }
                                }
                            }}
                            subpostsProps={{
                                postListProps: {
                                    toolbarProps: {
                                        disableViews: true
                                    },
                                    postCardProps: {
                                        postCardHeaderProps: {
                                            postMoreActionsProps: {
                                                onDelete: deleteNode,
                                                onEdit: modifyNode,
                                            }
                                        }
                                    }
                                },
                                postCreatorProps: {
                                    onCreate: (post) => {
                                        const newNode = generateNode(post)
                                        const newEdge = {
                                            source: viewId!!.toString(),
                                            target: newNode.id
                                        }
                                        links.push(newEdge)
                                        nodes.push(newNode)
                                        nodeMap.set(post.postId, newNode)
                                        setChanged(!changed)
                                    }
                                }
                            }}
                            onChange={modifyNode}
                            style={{borderRadius: 0}}
                        />
                    </div>
                </SuspenseLoader>
            }
           
        />
    )
}
