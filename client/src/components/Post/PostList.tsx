import React, { Suspense, useEffect, useState } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import PostListToolbar, { PostListToolbarProps, Sort, View } from './PostListToolbar';
import PostCard, { PostCardProps, PostLocation } from './PostCard';
import { PostListFragment$key } from './__generated__/PostListFragment.graphql';
import InfiniteScroll from 'react-infinite-scroll-component';
import Typography from '../Shared/Typography';
import PostListItem from './PostListItem';
import { useHistory, useLocation } from 'react-router';
import { queryString, removeParam, updateUrlParameter } from '../../utils/urlutils';
import Dialog from '../Shared/Dialog'
import PostGraph from '../GraphProject/PostGraph';

const defaultParams: PostListParams = {
    view: 'Card',
    sort: 'New',
    filter: null
}

export interface PostListProps {
    posts: any,
    loadNext: (params: any) => void,
    hasNext: boolean,
    postCardProps?: Partial<PostCardProps>,
    refetch?: (args: any) => void,
    isLoadingNext: boolean,
    hideToolbar?: boolean,
    parentPostId?: number | null
    spaceId?: number
    location: PostLocation,
    emptyMessage?: string,
    disabledActions?: string[],
    defaultView?: View,
    toolbarProps?: Partial<PostListToolbarProps>,
    type?: 'state' | 'query',
}

interface PostListParams {
    filter?: null | string,
    sort?: Sort,
    view?: View,
    subpostId?: number
}

export default function PostList({posts, loadNext, hasNext, parentPostId, spaceId, type = 'state', defaultView = 'Card', toolbarProps, disabledActions, emptyMessage, location, hideToolbar, isLoadingNext, refetch, postCardProps, ...props}: PostListProps) {
    const {edges, __id} = useFragment<PostListFragment$key>(
        graphql`
            fragment PostListFragment on PostConnection {
                __id
                edges {
                    node {
                        postId
                        createdBy
                        ...PostCardFragment
                        ...PostListItemFragment
                    }
                }
            }
        `,
        posts
    )
    
    const stateBased = type === 'state'
    
    const [state, setState] = useState<PostListParams>({
        ...defaultParams,
        view: defaultView
    })

    const here = useLocation()
    const history = useHistory()
    const query = here.search
    let params = queryString.parse(query) as PostListParams
    params = {...defaultParams, ...params}
    
    const view = stateBased ? state.view : params.view
    const filter = stateBased ? state.filter : params.filter
    const sort = stateBased ? state.sort : params.sort
    const subpostId = stateBased ? state.subpostId : params.subpostId

    const changeParams = (key: keyof PostListParams, value?: string | null) => {
        if (stateBased) {
            const newState = {...state} as any
            newState[key] = value
            setState(newState)
        } else {
            const fullUrl = here.pathname + query
            history.replace(value ? updateUrlParameter(fullUrl, key, value) : removeParam(fullUrl, key))
        }
    }

    const changeFilter = (filter: string | null) => changeParams('filter', filter)
    const changeSort = (sortBy: Sort) => changeParams('sort', sortBy)
    const changeView = (view?: View) => {
        changeParams('view', view)
    }
    const openPost = (postId: number) => changeParams('subpostId', postId.toString())
    const closePost = () => changeParams('subpostId')

    useEffect(() => {
        refetch && refetch({filterTypes: filter ? [filter] : null})
    }, [filter])

    useEffect(() => {
        refetch && refetch({sortBy: sort})
    }, [sort])
    
    return (
        <div style={{width: '100%'}}>
            {
                !hideToolbar && refetch && 
                <PostListToolbar
                    sort={sort!!}
                    filter={filter!!}
                    view={view ? view : defaultView}
                    changeFilter={changeFilter}
                    changeSort={changeSort}
                    changeView={changeView}
                    style={{marginBottom: 5, marginLeft: 15, marginRight: 15}}
                    {...toolbarProps}
                />
            }
            {
                edges?.length === 0 && emptyMessage && 
                <div style={{textAlign: 'center'}}>
                    <Typography>
                        {emptyMessage}
                    </Typography>
                </div>
            }
            <InfiniteScroll
                next={() => loadNext(20)}
                hasMore={hasNext}
                loader={<div/>}
                dataLength={edges ? edges.length : 0}
            >
                {
                    edges && edges.map((e) => {
                        let commonProps = {
                            ...postCardProps,
                            post: e!!.node,
                            connectionId: __id,
                            parentPostId,
                            disabledActions,
                            location,
                        }
                        
                        switch (view) {
                            case 'List':
                                return (
                                    <Suspense fallback={<div/>}>
                                        <PostListItem
                                            {...commonProps}
                                        />
                                    </Suspense>
                                )
                            default:
                                return (
                                    <Suspense fallback={<div/>}>
                                        <PostCard
                                            {...commonProps}
                                            style={{marginBottom: 15, marginLeft: 15, marginRight: 15}}
                                        />
                                    </Suspense>
                                )
                        }
                    })
                }
            </InfiniteScroll>
            <Dialog
                open={!!(view === 'Graph' && !toolbarProps?.disableViews)}
                onClose={() => history.replace(here.pathname)}
                fullScreen
                PaperProps={{
                    style: {backgroundColor: '#191919'}
                }}
            >
                <PostGraph
                    postId={parentPostId}
                    spaceId={spaceId}
                    viewId={subpostId}
                    openPost={openPost}
                    closePost={closePost}
                    exit={() => history.replace(here.pathname)}
                />
            </Dialog>
        </div>
    )
}
