import { CircularProgress, IconButton, Menu } from '@material-ui/core'
import { MoreVert } from '@material-ui/icons'
import React, { Suspense, useState } from 'react'
import { useFragment } from 'react-relay'
import ExistingPostEditor from './ExistingPostEditor'
import { Anchor } from './PostContentEditor'
import PostMoreActions, { PostMoreActionsProps } from './PostMoreActions'
import graphql from 'babel-plugin-relay/macro';
import { uniqueId } from 'lodash'
import { useParams } from 'react-router'

interface PostMoreActionsButtonProps {
    postMoreActionsProps?: Partial<PostMoreActionsProps>,
    post: any,
}

interface PostMoreActionsButtonState {
    anchorEl: Anchor,
    editing: boolean
}

export default function PostMoreActionsButton({postMoreActionsProps, post}: PostMoreActionsButtonProps) {
    const {postId, spacePost, ...data} = useFragment(
        graphql`
            fragment PostMoreActionsButtonFragment on Post {
                postId
                ...PostMoreActionsFragment
                spacePost(spaceId: $spaceId) {
                    spaceId
                }
            }
        `,
        post
    )

    const {spaceID} = useParams<any>()

    const spaceId = spacePost?.spaceId ? spacePost.spaceId : parseInt(spaceID)

    const [state, setState] = useState<PostMoreActionsButtonState>({
        anchorEl: null,
        editing: false
    })

    return (
        <div>
            <IconButton 
                onClick={(e) => setState({...state, anchorEl: e.currentTarget})}
                size="small"
            >
                <MoreVert/>
            </IconButton>
            {
                state.anchorEl && 
                <Menu
                    open={!!state.anchorEl}
                    anchorEl={state.anchorEl}
                    onClose={() => setState({...state, anchorEl: null})}
                >
                        <Suspense fallback={<CircularProgress/>}>

                            <PostMoreActions
                                {...postMoreActionsProps}
                                post={data}
                                onClose={() => setState({...state, anchorEl: null})}
                                onEdit={() => setState({...state, editing: true, anchorEl: null})}
                                size="small"
                            />
                        </Suspense> 
                </Menu>
            }
            
            {
                state.editing &&
                <Suspense
                    fallback={<div/>}
                >
                    <ExistingPostEditor
                        postId={postId!!}
                        open={state.editing}
                        spaceId={spaceId}
                        fetchKey={uniqueId()}
                        parentPostId={postMoreActionsProps?.parentPostId}
                        onClose={() => setState({...state, editing: false})}
                    />
                </Suspense>
            }
        </div>
    )
}
