import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePaginationFragment, usePreloadedQuery } from 'react-relay';
import PostCreator from '../Post/PostCreator';
import PostList from '../Post/PostList';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import { SpaceFilesFragment$key } from './__generated__/SpaceFilesFragment.graphql';
import { SpaceFilesQuery } from './__generated__/SpaceFilesQuery.graphql';
import { SpacePostConnectionQuery } from './__generated__/SpacePostConnectionQuery.graphql';

interface SpaceFilesProps {
    queryRef: any
}

export default function SpaceFiles({queryRef} : SpaceFilesProps) {
    const {space, me} = usePreloadedQuery<SpaceFilesQuery>(
        graphql`
            query SpaceFilesQuery($spaceId: Int, $postCount: Int!, $tagCount: Int!, $tagCursor: String, $reactionCount: Int!, $reactionCursor: String, $postCursor: String) {
                space(spaceId: $spaceId) {
                    spaceId
                    ...SpaceFilesFragment
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

    const {data, ...args} = usePaginationFragment<SpacePostConnectionQuery, SpaceFilesFragment$key>(
        graphql`
            fragment SpaceFilesFragment on Space @refetchable(queryName: "SpaceFileConnectionQuery") {
                posts(first: $postCount, after: $postCursor, sortBy: "Best", filterTypes: ["File"], includeAllTypes: true) 
                @connection(key: "SpaceFilesFragment_posts") {
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

    return (
        <div style={{minHeight: 1000}}>
            <MaxWidthWrapper width={600}>
                <div>
                    <PostList
                        {...args}
                        posts={data?.posts}
                        toolbarProps={{
                            disabledViews: ['Calendar']
                        }}
                        hideToolbar 
                        location={'space'}
                        type='query'
                        emptyMessage={'No files'}
                        spaceId={space?.spaceId}
                    />
                </div>
            </MaxWidthWrapper>
        </div>
    )
}
