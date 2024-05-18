import graphql from 'babel-plugin-relay/macro';
import { usePaginationFragment, usePreloadedQuery } from 'react-relay';
import PostCreator from '../Post/PostCreator';
import PostList from '../Post/PostList';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import { SpaceEventsFragment$key } from './__generated__/SpaceEventsFragment.graphql';
import { SpaceEventsQuery } from './__generated__/SpaceEventsQuery.graphql';
import { SpacePostConnectionQuery } from './__generated__/SpacePostConnectionQuery.graphql';

interface SpaceEventsProps {
    queryRef: any
}

export default function SpaceEvents({queryRef} : SpaceEventsProps) {
    const {space, me} = usePreloadedQuery<SpaceEventsQuery>(
        graphql`
            query SpaceEventsQuery($spaceId: Int!, $postCount: Int!, $tagCount: Int!, $tagCursor: String, $reactionCount: Int!, $reactionCursor: String, $postCursor: String) {
                space(spaceId: $spaceId) {
                    spaceId
                    ...SpaceEventsFragment
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

    const {data, ...args} = usePaginationFragment<SpacePostConnectionQuery, SpaceEventsFragment$key>(
        graphql`
            fragment SpaceEventsFragment on Space @refetchable(queryName: "SpaceEventsConnectionQuery") {
                posts(first: $postCount, after: $postCursor, sortBy: "Recent", filterTypes: ["Event"]) 
                @connection(key: "SpaceEventsFragment_posts") {
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
                            postType={'Event'}
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
                        emptyMessage={'No upcoming events'}
                        spaceId={space?.spaceId}
                    />
                </div>
            </MaxWidthWrapper>
        </div>
    )
}
