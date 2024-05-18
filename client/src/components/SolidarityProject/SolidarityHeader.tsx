import React, { useEffect, useState } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { SolidarityHeaderQuery } from './__generated__/SolidarityHeaderQuery.graphql';
import Typography from '../Shared/Typography';
import GeneralTabs from '../Shared/GeneralTabs';
import { useHistory, useParams } from 'react-router';
import { SpaceViewParams } from '../../types/router';
import { queryString } from '../../utils/urlutils';
import { useAppDispatch, useAppSelector } from '../../Store';
import ViewTabs from '../DatabaseViews/ViewTabs';
interface SolidarityHeaderProps {
    queryRef: any
}

export default function SolidarityHeader({queryRef}: SolidarityHeaderProps) {
    const { post } = usePreloadedQuery<SolidarityHeaderQuery>(
        graphql`
            query SolidarityHeaderQuery($postId: ID!) {
                post(postId: $postId) {
                    title
                    postId
                    v: views(first: 1) {
                        edges {
                            node {
                                name
                                viewId
                            }
                        }
                    }
                    ...ViewTabsFragment
                }
            }
        `,
        queryRef
    )

    const history = useHistory()
    const { view } = queryString.parse(history.location.search)
    const dispatch = useAppDispatch()

    const changeView = (viewId: string) => {
        history.replace(history.location.pathname + `?view=${viewId}`)
        
    }

    useEffect(() => {
        const viewId = post?.v?.edges ? post.v.edges[0]?.node?.viewId : null
        if (!view && viewId) {
            changeView(viewId.toString())
        }
    }, [post?.postId])

    const onMenu = (option: string) => {
        switch (option) {
            case 'Rename':
                break
            case 'Edit':
                break
            
        }
    }

    const onAdd = () => {
        
    }

    return (
        <div style={{marginLeft: 3, position: 'relative', width: '100%'}}>
            <Typography variant='h6'>
                {post?.title}
            </Typography>
            <ViewTabs
                changeView={(link) => changeView(link)}
                currView={view as string}
                database={post}
                onMenu={onMenu}
            />
            <div style={{position: 'absolute', right: 5, top: 0, display: 'flex', alignItems: 'center', height: '100%'}}>
                
            </div>
        </div>
    )
}
