import { Paper, useTheme } from '@material-ui/core'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router';
import { usePreloadedQuery, useQueryLoader} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { Edge, Node } from '../DatabaseViews/GraphView';
import SolidarityPostView from './SolidarityPostView';
import SolidarityPostViewQuery from './__generated__/SolidarityPostViewQuery.graphql'
import SuspenseLoader from '../Shared/SuspenseLoader';
import GraphView from '../DatabaseViews/GraphView';
import { postToNode } from '../GraphProject/PostGraph';
import PostDrawerLayout from '../Layouts/PostDrawerLayout';
import { SolidarityMainQuery } from './__generated__/SolidarityMainQuery.graphql';
import { SpaceViewParams } from '../../types/router';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { drawerWidth, menuHeight } from '../Projects/ProjectView';
import GraphActions from '../DatabaseViews/GraphActions';
import Typography from '../Shared/Typography';
import { scaleNum, shuffleArray } from '../../utils/arrayutils';
import { useAppSelector } from '../../Store';
import { canHover } from '../../utils/domutils';
import HelpFab from '../Help/HelpFab';
import GraphKey from '../DatabaseViews/GraphKey';

export const sidebarWidth = 500
let colors = ['red', 'green', 'lightblue', 'yellow', 'beige', 'orange', 'brown', '#9B26B6', '#7FFFD4', '#ff5349']
colors = [...colors, ...colors]
const scaledMax = 50
const scaledMin = 1.5

interface SolidarityMainProps {
    queryRef: any,
    refreshGraph: () => void
}

export default function SolidarityMain({ queryRef, refreshGraph }: SolidarityMainProps) {
    const { postGraph, space, post } = usePreloadedQuery<SolidarityMainQuery>(
        graphql`
            query SolidarityMainQuery($postId: Int!, $parentPostId: ID! $spaceId: Int!, $viewId: Int) {
                postGraph(postId: $postId, excludeParent: true, viewId: $viewId) {
                    edges {
                        post1Id
                        post2Id
                    }
                    nodes {
                        postId
                        type
                        icon
                        title
                        attributeValues(postId: $postId) {
                            attributeId
                            textValue
                        }
                    }
                }
                space(spaceId: $spaceId) {
                    ...GraphActionsFragment
                    permissions {
                        canImportPosts
                    }
                }
                post(postId: $parentPostId) {
                    postId
                    deleted
                    attributes(first: 1000) {
                        edges {
                            node {
                                attributeId
                                name
                                type

                            }
                        }
                    }
                }
            }
        `,
        queryRef
    )

    const canImport = space?.permissions?.canImportPosts

    const attributes = post?.attributes?.edges ? post.attributes.edges.map((e, i) => ({
        color: colors[i]!!,
        name: e?.node?.name!!,
        id: e?.node?.attributeId!!.toString(),
        type: 'Checkbox'
    })).filter(({name}) => !['Coalition', 'Space', 'icons', 'Active Membership Size'].includes(name)) : []

    const {postID, spacePage, spaceID, subPage, viewId} = useParams<SpaceViewParams>()

    const graphRef = useRef()
    const graph = graphRef.current as any
    const history = useHistory()
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'

    const [changed, setChanged] = useState(false)

    const {nodes, links, nodeMap, linkMap, inLinkMap, additionalAttrs} = useMemo(() => {
        let nodes: Node[] = []
        let links: Edge[] = []
        const nodeMap = new Map() // maps all nodes to their ids for quick edits and deletes
        const linkMap = new Map() // maps all outgoing edges to their node id
        const inLinkMap = new Map()
        const additionalAttrs: any[] = []

        if (postGraph && postGraph.nodes!!.length > 0) {
            links = postGraph.edges ? postGraph.edges.map(({post1Id, post2Id}: any) => {
                const source = post1Id.toString()
                const target = post2Id.toString()
                
                let existingLinks = linkMap.get(source)
                existingLinks = existingLinks ? existingLinks : []

                const newLink = {source, target}
                existingLinks.push(newLink)

                linkMap.set(source, existingLinks)

                existingLinks = inLinkMap.get(target)
                existingLinks = existingLinks ? existingLinks : []
                
                const inLink = {target, source}
                existingLinks.push(inLink)

                inLinkMap.set(target, existingLinks)

                return newLink
            }) : []

            const entries = Array.from(linkMap.entries())
           
            let min: number
            let max: number

            if (entries.length > 0) {
                min = entries[0][1].length!!;
                max = entries[0][1].length!!;
                for (let [_, value] of entries) {
                    if (value.length < min) min = value.length
                    if (value.length > max) max = value.length
                }
            }

            const coalitionAttrId = post?.attributes?.edges?.find((e) => e?.node?.name === 'Coalition')?.node?.attributeId

            nodes = postGraph.nodes ? postGraph.nodes
            .filter((post: any) => { 
                return inLinkMap.get(post.postId.toString())?.length > 0 || linkMap.get(post.postId.toString())?.length > 0
            })
            .map((post: any) => {
                const node: Node = postToNode(post as any, {omitImage: true})
                const coalitionAttr = post?.attributeValues?.find((attr: any) => attr.attributeId === coalitionAttrId)

                const isCoalition = (coalitionAttr?.textValue === 'TRUE' || post.type == 'Coalition')

                if (isCoalition)
                    additionalAttrs.push({
                        name: post.title,
                        id: post.postId.toString(),
                        type: 'Checkbox',
                        isCoalition
                    })

                let size = linkMap.get(post.postId.toString())?.length + (isCoalition ? 25 : 0)
                size = size ? size : 1
                node.val = min && max && scaleNum(size, min, max, scaledMin, scaledMax)
                nodeMap.set(post?.postId, node)
                return node
            }) : []
        }        
        
        return {nodes, links, nodeMap, linkMap, inLinkMap, additionalAttrs}
    }, [changed, post?.postId])

    const [
        postViewQueryRef,
        loadPostViewQuery,
    ] = useQueryLoader(    
        SolidarityPostViewQuery,    
    );

    React.useEffect(() => {
        if (postID) {
            loadPostViewQuery({postId: postID, spaceId: parseInt(spaceID), userCount: 100, postCount: 1000})
        }
    }, [postID, graph])


    const onNodeClick = ({id, x, y}: Node) => {
        history.replace(`/space/${spaceID}/${spacePage}/${id}` + history.location.search)
    }

    const {height, width} = useWindowDimensions()
    const mobile = useAppSelector(state => state.uiActions.mobile)

    useEffect(() => {
        post?.deleted && history.replace(`/space/${spaceID}`)
    }, [post?.deleted])

    const [filterOut, setFilterOut] = useState<string[]>([])
    const [filteredNodes, setFilteredNodes] = useState(nodes)
    const [filteredLinks, setFilteredLinks] = useState(links)

    const toggleAttribute = (name: string) => {
        let newFilters: string[]
        if (name == '') {
            newFilters = filterOut
        } else if (filterOut.includes(name)) {
            newFilters = filterOut.filter(id => id !== name)
        } else {
            newFilters = [...filterOut, name]
        }

        const inactiveAttr = attributes.find(({name}) => name == 'Inactive')
        const filterOutInactive = inactiveAttr && newFilters.includes(inactiveAttr.id!!)
                
        setFilterOut(newFilters)

        if (newFilters.length == 0) {
            setFilteredLinks(links)
            setFilteredNodes(nodes)
            return
        }

        const attributeMap: any = {}
        additionalAttrs.forEach((attr) => {
            attributeMap[attr.id!!] = attr
        })

        const nodeBlacklist = new Set()

        const filterSet = new Set()
        newFilters.forEach(f => {
            const attr = attributeMap[f]
            filterSet.add(f)

            if (attr && attr.isCoalition) {
                nodeBlacklist.add(attr.id)
            }
        })


        nodeBlacklist.forEach((coalitionId) => {
            const links: Edge[] = linkMap.get(coalitionId)
            links && links.forEach(({target}) => {
                const incoming: Edge[] = inLinkMap.get((target as any).id)
                let exclude = true
                incoming.forEach(({source}) => {
                    if (!nodeBlacklist.has(source)) {
                        exclude = false
                    }
                })
                if (exclude) nodeBlacklist.add((target as any).id)
            })
        })
        
        const acceptableIds = new Set()

        let filteredNodes = nodes.filter(({attributes, type, id}) => {
            if (nodeBlacklist.has(id))
                return false

            if (!attributes?.length)
                return true

            let allowed = false
            
            for (let i = 0; i < attributes.length; i++) {
                const currValue = attributes[i]

                if (filterOutInactive && inactiveAttr && currValue.attributeId == inactiveAttr.id && currValue.value) {
                    return false
                }

                if (!filterSet.has(currValue.attributeId)) {
                    allowed = true
                }
            }

            return allowed
            
        })

        filteredNodes.forEach((({id}) => acceptableIds.add(id)))

        const filteredLinks = links.filter(({source, target}) => {
            return acceptableIds.has((source as any).id) && acceptableIds.has((target as any).id)
        })

        setFilteredNodes(filteredNodes)
        setFilteredLinks(filteredLinks)
    }

    useMemo(() => {
        console.log('filtering')
        toggleAttribute('')
    }, [nodes, links])

    return (
        <PostDrawerLayout
            open={!!postID}
            main={
                <div style={{position: 'relative', height: '100%', width: "100%"}}>
                    {
                        nodes.length > 0 ? 
                        <GraphView
                            nodes={filteredNodes}
                            links={filteredLinks}
                            linkColor={darkMode ? 'grey' : 'lightgrey'}
                            onNodeClick={canHover ? onNodeClick : () => {}}
                            onNodeDblClick={!canHover ? onNodeClick : undefined}
                            attributes={attributes}
                            height={height - (menuHeight + 10)}
                            width={width}
                            extendLinks
                            fixPositions={'altKey'}
                            attrRenderingMethod={'badge'}
                            toggleAttribute={toggleAttribute}
                            additionalOptions={(
                                <GraphKey
                                    attributes={additionalAttrs}
                                    toggleAttribute={toggleAttribute}
                                    customPrompt={'Coalitions'}
                                />
                            )}
                        />
                        :
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                            <Typography variant='h6'>
                                This map is empty
                            </Typography>
                        </div>
                    }
                    {
                        canImport && 
                        <GraphActions
                            onCreateNode={() => {}}
                            onCreateEdge={() => {}}
                            space={space}
                            onImport={() => {
                                refreshGraph()
                                setTimeout(() => {
                                    setChanged(!changed)
                                }, 200)
                            }}
                            postId={parseInt(spacePage)}
                            style={{position: 'absolute', bottom: 20, left: '50%'}}
                        />
                    }
                    <div style={{position: 'absolute', right: 20, bottom: 20}}>
                        <HelpFab/>
                    </div>
                </div>
            }
            postView={
                <SuspenseLoader
                    queryRef={postViewQueryRef}
                    fallback={<div/>}
                >
                    <Paper style={{height: '100%', overflow: 'auto', borderTopRightRadius: 0, borderBottomRightRadius: 0}}>
                        <SolidarityPostView
                            style={{padding: 20}}
                            queryRef={postViewQueryRef}
                            onClose={() => history.replace(`/space/${spaceID}/${spacePage}` + history.location.search)}
                            onChange={() => {}}
                        />
                    </Paper>
                </SuspenseLoader>
            }
            postViewWidth={sidebarWidth}
        />
    )
}
