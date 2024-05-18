import React, { CSSProperties, Fragment, useState } from 'react'
import { useFragment, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpacePreview from '../Space/SpacePreviewButton';
import usePagination from '@mui/material/usePagination/usePagination';
import { PostPathQuery } from './__generated__/PostPathQuery.graphql';
import { PostPathFragment_post$key } from './__generated__/PostPathFragment_post.graphql';
import PostPreview from './PostPreview';
import Typography from '../Shared/Typography';
import { ChevronLeft, MoreHoriz } from '@material-ui/icons';
import Button from '../Shared/Button'
import { CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostIcon from './PostIcon';

const delimiter = (
    <Typography color="textSecondary">
        /
    </Typography>
)

interface PostPathProps {
    space: any,
    post: any,
    style?: CSSProperties,
    onSpaceClick: (spaceId: number) => void
    onPostClick: (postId: number) => void,
    includeBackButton?: boolean,
    goBack?: (spaceId: number, lastPostId?: number | null) => void
}

export default function PostPath({space, post, style, onPostClick, goBack, includeBackButton, onSpaceClick}: PostPathProps) {
    const {spaceId, ...spaceData} = useFragment(
        graphql`
            fragment PostPathFragment_space on Space {
                spaceId
                ...SpacePreviewButtonFragment
            }
        `,
        space
    )

    const { data, loadNext, hasNext } = usePaginationFragment<PostPathQuery, PostPathFragment_post$key>(
        graphql`
            fragment PostPathFragment_post on Post @refetchable(queryName: "PostPathQuery") {
                postId
                ...PostPreviewFragment
                last: path(first: 1, count: 1, spaceId: $spaceId, reverse: true) {
                    edges {
                        node {
                            postId
                            ...PostPreviewFragment
                        }
                    }
                }
                path(first: $pathCount, after: $pathCursor, spaceId: $spaceId) @connection(key: "PostPathFragment_path") {
                    edges {
                        node {
                            postId
                            title
                            ...PostIconFragment
                        }
                    }
                }
            }
        `,
        post ? post : null
    )

    const last = (data?.last?.edges && data.last.edges.length > 0) ? data?.last?.edges[0]!!.node : null

    const [anchorEl, setAnchorEl] = useState<Element | null>(null)

    return (
        <div style={{...style, display: 'flex', alignItems: 'center'}}>
            {
                includeBackButton && 
                <IconButton
                    size='small'
                    onClick={() => goBack && goBack(spaceId, last?.postId)}
                >
                    <ChevronLeft
                        fontSize='small'
                    />
                </IconButton>
            }
            <SpacePreview
                space={spaceData}
                onClick={() => onSpaceClick(spaceId)}
                truncate={!!(data?.path?.edges?.length && data.path?.edges?.length > 0)}
            />
            {
                data?.path?.edges && data.path.edges.length > 1 && 
                <Fragment>
                    {delimiter}
                    <Button size="small" onClick={e => setAnchorEl(e.currentTarget)}>
                        <MoreHoriz fontSize='small'/>
                    </Button>
                    <Menu 
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                    >
                        <div id="scrollableDiv">
                            <InfiniteScroll
                                next={() => loadNext(20)}
                                hasMore={hasNext}
                                loader={<CircularProgress/>}
                                dataLength={data.path.edges.length}
                            >
                                {
                                    data.path.edges.slice(0, data.path.edges.length - 1).map(e => (
                                        <MenuItem
                                            onClick={() => {
                                                setAnchorEl(null)
                                                onPostClick(e!!.node!!.postId!!)
                                            }}
                                        >
                                            <ListItemIcon>
                                                <PostIcon
                                                    post={e?.node}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={e?.node?.title}
                                            />
                                        </MenuItem>
                                    ))
                                }
                            </InfiniteScroll>
                        </div>
                    </Menu>
                </Fragment>
            }
            {
                last && 
                <Fragment>
                    {delimiter}
                    <PostPreview
                        post={last}
                        truncate
                        onClick={() => onPostClick(last!!.postId!!)}
                    />
                </Fragment>
            }
            {
                data &&
                <Fragment>
                    {delimiter}
                    <PostPreview
                        post={data}
                        truncate={!!last}
                        onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth'})}
                    />
                </Fragment>
            }
        </div>
    )
}
