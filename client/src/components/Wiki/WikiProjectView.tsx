import React from 'react'
import { useHistory, useParams } from 'react-router';
import { useAppDispatch } from '../../Store';
import Wiki from './Wiki';
import { usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { WikiProjectViewQuery } from './__generated__/WikiProjectViewQuery.graphql';
import { Paper } from '@material-ui/core';

interface WikiProjectViewProps {
    queryRef: any
}

export default function WikiProjectView({queryRef}: WikiProjectViewProps) {
    const {space, me} = usePreloadedQuery<WikiProjectViewQuery>(
        graphql`
            query WikiProjectViewQuery($spaceId: Int!, $wikiCount: Int!, $wikiCursor: String) {
                space(spaceId: $spaceId) {
                    spaceId
                    ...WikiSidebarFragment
                }
                me {
                    darkMode
                }
            }
        `,
        queryRef
    )

    const history = useHistory()
    const {spacePage, postID} = useParams<any>()

    const openPage = (page: string) => {
        history.replace(`/space/${space!!.spaceId}/${page}`)
    }
    const openPost = (postId: number) => {
        history.replace(`/space/${space!!.spaceId}/post/${postId}`)
    }

    return (
        <Paper style={{height: '100vh', borderRadius: 0, boxShadow: 'none', backgroundColor: me?.darkMode ? '#222222' : undefined, width: '100vw'}}>
            <Wiki
                viewing={spacePage}
                postId={postID}
            />
        </Paper>
    )
}
