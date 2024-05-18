import React, { Fragment, ReactElement, Suspense, useEffect } from 'react'
import { Avatar, Card, CardActions, CardContent, CardHeader, CircularProgress, Collapse, Divider } from '@material-ui/core'
import { useFragment, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { useHistory, useParams } from 'react-router';
import PostCardHeader, { PostCardHeaderProps } from './PostCardHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import PostReactions from './PostReactions';
import CommentsSection from '../Comments/CommentsSection';
import PinIcon from '../Shared/PinIcon';
import Typography from '../Shared/Typography';
import PostFiles from './PostFiles';

export type PostLocation = 'space' | 'dashboard' | 'subposts' | 'profile'

export interface PostCardProps {
    post: any,
    style?: React.CSSProperties,
    disableCard?: boolean,
    connectionId?: string,
    parentPostId?: number | null,
    location: PostLocation,
    headerAddOn?: ReactElement,
    onClick?: (postId: number) => void,
    includeArrow?: boolean,
    postCardHeaderProps?: Partial<PostCardHeaderProps>
}

export default React.memo(function PostCard({post, connectionId, style, onClick, postCardHeaderProps, headerAddOn, parentPostId, disableCard, location, ...props}: PostCardProps) {
    const {postId, deleted, type, spacePost, parentRelation, ...data} = useFragment(
        graphql`
            fragment PostCardFragment on Post {
                postId
                type
                ...PostCardHeaderFragment
                ...PostActionsFragment
                ...PostContentFragment
                ...PostReactionsFragment
                ...PostFilesFragment
                spacePost(spaceId: $spaceId) {
                    id
                    spacePostId
                    spaceId
                    pinned
                }
                parentRelation {
                    relationId
                    pinned
                }
                deleted
            }
        `,
        post
    )

    const [state, setState] = React.useState({
        commentsOpen: false,
        reactionConnectionId: '',
        loadedComments: false
    })
    const {spaceID} = useParams<any>()
    const history = useHistory()

    const spaceId = spaceID ? spaceID : spacePost.spaceId

    const openSubposts = () => {
        spaceId && history.push(`/space/${spaceId}/post/${postId}#subposts`)
    }

    const postCard = (
        <React.Fragment>
            {headerAddOn}
            <PostCardHeader
                {...postCardHeaderProps}
                post={data}
                postMoreActionsProps={{
                    ...postCardHeaderProps?.postMoreActionsProps,
                    connectionId,
                    parentPostId,
                    location,
                }}
                {...props}
            />
            
            {
                !deleted && 
                <Fragment>
                    <CardContent style={{paddingTop: 15, paddingBottom: 10}}>
                        <PostContent
                            post={data}
                            collapsible
                        />
                    </CardContent>
                    <PostReactions
                        style={{marginLeft: 10, marginRight: 10}}
                        post={data}
                        getConnection={reactionConnectionId => setState({...state, reactionConnectionId})}
                    />
                    <PostFiles
                        post={data}
                    />
                    <Divider style={{width: '100%'}}/>
                    <CardActions>
                        <PostActions
                            post={data}
                            openSubposts={openSubposts}
                            toggleComments={() => setState({...state, commentsOpen: !state.commentsOpen, loadedComments: true})}
                            reactionConnectionId={state.reactionConnectionId}
                        />
                    </CardActions>
                    <Collapse in={!!(state.commentsOpen)} style={{width: '100%'}}>
                        <Suspense 
                            fallback={
                                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                                    <CircularProgress/>
                                </div>
                            } 
                        >
                            <Divider style={{ marginBottom: 5, width: '100%'}}/>
                            {
                                state.loadedComments && 
                                <CommentsSection
                                    postId={postId}
                                    style={{marginTop: 15, paddingBottom: 10, paddingLeft: 15, paddingRight: 15}}
                                />
                            }
                        </Suspense>
                    </Collapse>
                </Fragment>
            }
        </React.Fragment>
    )


    return (
        <div style={style} onClick={() => onClick && onClick(postId)}>
            {
                disableCard ? 
                postCard
                :
                <Card>
                    {postCard}
                </Card>
            }
        </div>
    )
}, (prevProps, nextProps) => prevProps?.post === nextProps.post)