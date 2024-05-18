import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@mui/material';
import graphql from 'babel-plugin-relay/macro';
import React, { useEffect, useState } from 'react';
import { usePaginationFragment, usePreloadedQuery } from 'react-relay';
import Sticky from 'react-sticky-el';
import PostCreator from '../Post/PostCreator';
import PostList from '../Post/PostList';
import SpaceInfoCard from '../Space/SpaceInfoCard';
import SpaceTagsCard from './SpaceTagsCard';
import { SpaceHomeFragment$key } from './__generated__/SpaceHomeFragment.graphql';
import { SpaceHomeQuery } from './__generated__/SpaceHomeQuery.graphql';
import { SpacePostConnectionQuery } from './__generated__/SpacePostConnectionQuery.graphql';
import { useAppSelector } from '../../Store'

interface SpaceHomeProps {
    queryRef: any
}

export default function SpaceHome({queryRef} : SpaceHomeProps) {
    const {space, me} = usePreloadedQuery<SpaceHomeQuery>(
        graphql`
            query SpaceHomeQuery($spaceId: Int, $postCount: Int!, $tagCount: Int!, $tagCursor: String, $reactionCount: Int!, $reactionCursor: String, $postCursor: String, $filterTypes: [String], $sortBy: String) {
                space(spaceId: $spaceId) {
                    spaceId
                    ...SpaceInfoCardFragment
                    ...SpaceHomeFragment
                    ...SpaceTagsCardFragment
                    ...PostCreatorFragment_space
                    permissions {
                        canPinPosts
                    }
                }
                me {
                    userId
                    ...PostCreatorFragment_user
                }
            }
        `,
        queryRef
    )
    const permissions = space?.permissions
    const [loaded, setLoaded] = useState(false)

    const {data, ...args} = usePaginationFragment<SpacePostConnectionQuery, SpaceHomeFragment$key>(
        graphql`
            fragment SpaceHomeFragment on Space @refetchable(queryName: "SpacePostConnectionQuery") {
                posts(first: $postCount, after: $postCursor, sortBy: $sortBy, filterTypes: $filterTypes, hierarchy: true) 
                @connection(key: "SpaceHomeFragment_posts") {
                    __id
                    edges {
                        node {
                            postId
                            createdBy
                        }
                    }
                    ...PostListFragment
                }
            }
        `,
        space
    )

    const connectionId = data?.posts?.__id


    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const sidebarOpen = useAppSelector(state => state.nav.sidebarOpen)
    const showCol = matches

    const disabledActions: string[] = []
    useEffect(() => {
        if (!permissions?.canPinPosts) {
            disabledActions.push('Pin')
        }
    }, [permissions])

    useEffect(() => {
        setTimeout(() => {
            setLoaded(true)
        }, 500)
    }, [])

    return (
        <div style={{minHeight: 1000}}>
            <div style={{display: 'flex'}}>
                <div style={{width: '100%'}}>
                    {
                        me && me.userId && 
                        <PostCreator
                            me={me}
                            connectionIds={connectionId ? [connectionId]: []}
                            space={space}
                            style={{marginLeft: 15, marginRight: 15, marginBottom: 10}}
                            variant="dialog"
                            previewTypes={['Task', 'Event', 'Poll']}
                        />
                    }
                    <PostList
                        {...args}
                        posts={data?.posts}
                        toolbarProps={{
                            disabledViews: ['Calendar']
                        }}
                        type='query'
                        spaceId={space?.spaceId}
                        location={'space'}
                        emptyMessage={"Nothing here." + (me?.userId ? '' : 'Create an account to contribute' )}
                    />
                </div>
                {
                    showCol && 
                    <div style={{maxWidth: 350, minWidth: 350, width: '100%', minHeight: "100vh"}}>
                        <Sticky disabled={!loaded} stickyStyle={{marginTop: 65, zIndex: 1}} topOffset={-65}>
                            <div>
                                <SpaceInfoCard
                                    space={space}
                                    truncate
                                />
                                <SpaceTagsCard
                                    space={space}
                                    style={{marginTop: 15}}
                                    truncate
                                    hideIfEmpty
                                />
                            </div>
                        </Sticky>
                    </div>
                }
            </div>
        </div>
    )
}
