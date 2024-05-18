import React, { CSSProperties } from 'react'
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { MovePostMenuQuery } from './__generated__/MovePostMenuQuery.graphql';
import Typography from '../Shared/Typography';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress, Divider, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { MovePostMenuPostsQuery } from './__generated__/MovePostMenuPostsQuery.graphql';
import { MovePostMenuFragment$key } from './__generated__/MovePostMenuFragment.graphql';
import PostIcon from './PostIcon';
import { ChevronRight } from '@material-ui/icons';
import PostPath from './PostPath';
import SpacePreview, { PreviewProps } from '../Space/SpacePreviewButton';
import PostPreview from './PostPreview';
import PostListItem from './PostListItem';
import PostList from './PostList';

const previewProps: PreviewProps = {
    iconProps: {size: 30},
    titleProps: {variant: 'h6'}
}

interface MovePostMenuProps {
    postId: string,
    parentPostId: string | null,
    spaceId: number,
    onChangeParent: (parentPostId: number | null) => void,
    style?: CSSProperties,
}

export default function MovePostMenu({postId, parentPostId, spaceId, style, onChangeParent}: MovePostMenuProps) {
    const { parentPost, space} = useLazyLoadQuery<MovePostMenuQuery>(
        graphql`
            query MovePostMenuQuery($postId: ID!, $parentPostId: ID, $filterTypes: [String], $sortBy: String, $spaceId: Int!, $inPost: Boolean!, $relationCount: Int!, $relationCursor: String, $pathCount: Int!, $pathCursor: String, $reactionCount: Int!, $reactionCursor: String, $tagCount: Int!, $tagCursor: String) {
                parentPost: post(postId: $parentPostId) @include(if: $inPost) {
                    title
                    postId
                    ...MovePostMenuFragment
                    ...PostPreviewFragment
                    ...PostIconFragment
                    ...PostPathFragment_post
                }
                post(postId: $postId) {
                    title
                }
                space(spaceId: $spaceId) {
                    name
                    spaceId
                    ...MovePostMenuFragment 
                    ...SpacePreviewButtonFragment
                    ...PostPathFragment_space
                }
            }
        `,
        {postId, parentPostId, spaceId, inPost: !!parentPostId, relationCount: 20, sortBy: 'New', filterTypes: null, pathCount: 100, tagCount: 20, reactionCount: 20}
    )

    const {data, ...args} = usePaginationFragment<MovePostMenuPostsQuery, MovePostMenuFragment$key>(
        graphql`
            fragment MovePostMenuFragment on HasPosts @refetchable(queryName: "MovePostMenuPostsQuery") {
                posts(excludePostIds: [$postId], filterTypes: $filterTypes, sortBy: $sortBy, first: $relationCount, after: $relationCursor, hierarchy: true) @connection(key: "MovePostMenu_posts") {
                    edges {
                        node {
                            postId
                        }
                    }
                    ...PostListFragment
                    pageInfo {
                        hasNextPage
                    }
                }
            }
        `,
        parentPostId ? parentPost!! : space!!
    )

    const edges = data?.posts?.edges

    return (
        <div style={style}>
            <PostPath
                space={space}
                post={parentPost}
                onPostClick={(postId) => onChangeParent(postId)}
                onSpaceClick={() => onChangeParent(null)}
                includeBackButton
                goBack={(spaceId, postId) => onChangeParent(postId ? postId : null)}
            />
            <Divider
                style={{marginTop: 5, marginBottom: 5}}
            />
            <PostList
                parentPostId={parentPost?.postId}
                spaceId={space?.spaceId}
                posts={data?.posts}
                {...args}
                location={'subposts'}
                defaultView="List"
                toolbarProps={{
                    hideViews: true
                }}
                postCardProps={{
                    onClick: (postId) => onChangeParent(postId),
                    includeArrow: true
                }}
            />
            {
                edges && edges.length === 0 && 
                <Typography>
                    No posts
                </Typography>
            }
        </div>
    )
}
