import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePaginationFragment, usePreloadedQuery } from 'react-relay';
import PostCreator from '../Post/PostCreator';
import PostList from '../Post/PostList';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import { SpaceGoalsFragment$key } from './__generated__/SpaceGoalsFragment.graphql';
import { SpaceGoalsQuery } from './__generated__/SpaceGoalsQuery.graphql';
import { SpacePostConnectionQuery } from './__generated__/SpacePostConnectionQuery.graphql';

interface SpaceGoalsProps {
    queryRef: any
}

export default function SpaceGoals({queryRef} : SpaceGoalsProps) {
    const {space, me} = usePreloadedQuery<SpaceGoalsQuery>(
        graphql`
            query SpaceGoalsQuery($spaceId: Int, $postCount: Int!, $tagCount: Int!, $tagCursor: String, $reactionCount: Int!, $reactionCursor: String, $postCursor: String) {
                space(spaceId: $spaceId) {
                    spaceId
                    ...SpaceGoalsFragment
                    ...PostCreatorFragment_space
                }
                me {
                    userId
                    ...PostCreatorFragment_user
                }
            }
        `,
        queryRef
    )

    const {data, ...args} = usePaginationFragment<SpacePostConnectionQuery, SpaceGoalsFragment$key>(
        graphql`
            fragment SpaceGoalsFragment on Space @refetchable(queryName: "SpaceGoalConnectionQuery") {
                posts(first: $postCount, after: $postCursor, sortBy: "Best", filterTypes: ["Goal"]) 
                @connection(key: "SpaceGoalsFragment_posts") {
                    __id
                    edges {
                        node {
                            postId
                        }
                    }
                    ...PostListFragment
                }
            }
        `,
        space
    )

    const connectionId = data?.posts?.__id

    return (
        <div style={{minHeight: 1000}}>
            <MaxWidthWrapper width={600}>
                <div>
                    {
                        me && me.userId && 
                        <PostCreator
                            me={me}
                            connectionIds={connectionId ? [connectionId]: []}
                            space={space}
                            style={{marginLeft: 15, marginRight: 15, marginBottom: 10}}
                            variant="dialog"
                            postType={'Goal'}
                            hidePreviewTypes
                        />
                    }
                    <PostList
                        {...args}
                        posts={data?.posts}
                        toolbarProps={{
                            disabledViews: ['Calendar']
                        }}
                        hideToolbar 
                        location={'space'}
                        type='query'
                        emptyMessage={'No goals'}
                        spaceId={space?.spaceId}
                    />
                </div>
            </MaxWidthWrapper>
        </div>
    )
}
