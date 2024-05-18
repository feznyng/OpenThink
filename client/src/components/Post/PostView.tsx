import React, { CSSProperties, Fragment, useEffect } from 'react'
import { usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { Paper } from '@material-ui/core';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import PostMain, { PostMainProps } from './PostMain';
import { useHistory, useLocation } from 'react-router';
import { PostViewQuery } from './__generated__/PostViewQuery.graphql';
import { clearStore, putPost } from '../Task/TaskSlice';
import { useAppDispatch } from '../../Store';
import PostPath from './PostPath';
import Subposts, { SubpostsProps } from './Subposts';

const subpostsElementId = 'subposts'

interface PostViewProps {
    queryRef: any,
    style?: CSSProperties,
    subpostsProps?: Partial<SubpostsProps>,
    onChange?: (post: any) => void,
    postMainProps?: Partial<PostMainProps>
}

export default function PostView({queryRef, style, subpostsProps, onChange, postMainProps}: PostViewProps) {
    const {post, me, space} = usePreloadedQuery<PostViewQuery>(
        graphql`
            query PostViewQuery(
                    $postId: ID!, 
                    $postCount: Int!, 
                    $spaceId: Int!,
                    $reactionCount: Int!, 
                    $reactionCursor: String, 
                    $postCursor: String, 
                    $tagCount: Int!, 
                    $tagCursor: String,
                    $sortBy: String,
                    $filterTypes: [String],
                    $pathCount: Int!,
                    $pathCursor: String
            ) {
                post(postId: $postId) {
                    title
                    type
                    delta
                    postId
                    body
                    ...PostMainFragment
                    ...SubpostsFragment
                    ...PostBreadcrumbsFragment
                    ...PostCreatorFragment_post
                    ...PostPathFragment_post
                }
                me {
                    ...PostCreatorFragment_user
                }
                space(spaceId: $spaceId) {
                    spaceId
                    ...PostCreatorFragment_space
                    ...PostPathFragment_space
                }
            }
        `,
        queryRef
    )

    const dispatch = useAppDispatch()
    const location = useLocation()

    React.useEffect(() => {
        dispatch(clearStore())
        if (post?.postId) {
            dispatch(putPost(post))
        }
    }, [post?.postId])

    useEffect(() => {
        onChange && onChange(post)
    }, [post])
    
    const openSubposts = (smooth: boolean = true) => {
        const yOffset = -58; 
        const element = document.getElementById(subpostsElementId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: smooth ? 'smooth' : 'auto'});
        }
    }

    React.useEffect(() => {
        if (location.hash === '#subposts') {
            openSubposts(false)
        }
    }, [location.hash])

    const history = useHistory()
    return (
        <Fragment>
            <Paper style={style}>
                <MaxWidthWrapper
                    width={800}
                >
                    <PostPath
                        post={post}
                        space={space}
                        onSpaceClick={() => history.push(`/space/${space?.spaceId}`)}
                        onPostClick={(postId) => history.push(`/space/${space?.spaceId}/post/${postId}`)}
                        style={{paddingTop: 15, zIndex: 1000, paddingLeft: 10, paddingRight: 10}}
                    />
                    <PostMain
                        {...postMainProps}
                        post={post}
                        openSubposts={openSubposts}
                    />
                </MaxWidthWrapper>
            </Paper>
            <MaxWidthWrapper
                width={600}
                style={{marginTop: 10}}
            >
                <Subposts
                    {...subpostsProps}
                    me={me}
                    space={space}
                    post={post}
                />
            </MaxWidthWrapper>
        </Fragment>
    )
}
