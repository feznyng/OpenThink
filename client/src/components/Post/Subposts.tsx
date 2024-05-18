import { Suspense, useEffect } from 'react'
import { usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import PostList, { PostListProps } from './PostList';
import PostCreator, { PostCreatorProps } from './PostCreator';
import { PostsConnectionQuery } from './__generated__/PostsConnectionQuery.graphql';
import { SubpostsFragment$key } from './__generated__/SubpostsFragment.graphql';

export interface SubpostsProps {
    space: any,
    me: any,
    post: any,
    subpostsElementId?: string,
    postListProps?: Partial<PostListProps>,
    postCreatorProps?: Partial<PostCreatorProps>,
}

export default function Subposts({space, me, post, subpostsElementId, postListProps, postCreatorProps}: SubpostsProps) {
    const {data, ...args} = usePaginationFragment<PostsConnectionQuery, SubpostsFragment$key>(
        graphql`
            fragment SubpostsFragment on Post @refetchable(queryName: "PostsConnectionQuery") {
                posts(first: $postCount, after: $postCursor, spaceId: $spaceId, sortBy: $sortBy, filterTypes: $filterTypes) 
                @connection(key: "SubpostsFragment_posts") {
                    __id
                    edges {
                        node {
                            postId
                            ...PostGraphNodeFragment @relay(mask: false)
                        }
                    }
                    ...PostListFragment
                }
            }
        `,
        post
    )

    const connectionId = data?.posts?.__id

    return (
        <div>
            <PostCreator
                {...postCreatorProps}
                space={space}
                me={me}
                connectionIds={connectionId ? [connectionId] : []}
                post={post}
                previewTypes={['Task', 'Question', 'Information']}
                style={{marginBottom: 10, marginLeft: 15, marginRight: 15}}
            />
            <div
                id={subpostsElementId}
                style={{height: '100vh'}}
            >
                <Suspense
                    fallback={<div/>}
                >
                    <PostList
                        {...postListProps}
                        parentPostId={post?.postId}
                        spaceId={space?.spaceId}
                        posts={data?.posts}
                        {...args}
                        location={'subposts'}
                        type='query'
                    />
                </Suspense>
            </div>
        </div>
    )
}
