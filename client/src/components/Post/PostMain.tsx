import React, { CSSProperties, Suspense, useEffect } from 'react'
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import Typography from '../Shared/Typography';
import PostIcon from './PostIcon';
import UserIcon from '../User/UserIcon';
import PostActions from './PostActions';
import BannerImage from '../Shared/BannerImage';
import { CardContent, Collapse, Divider } from '@material-ui/core';
import { timeAgo } from '../../utils/dateutils'
import { useHistory } from 'react-router';
import PostContent from './PostContent';
import PostReactions from './PostReactions';
import CommentsSection from '../Comments/CommentsSection';
import CompleteButton from '../Task/CompleteButton';
import PostFiles from './PostFiles';
import { Anchor } from './PostContentEditor';
import PostMoreActionsButton from './PostMoreActionsButton';
import PostSubheader from './PostSubheader';
import { PostMoreActionsProps } from './PostMoreActions';

export interface PostMainProps {
    post: any,
    openSubposts: () => void,
    connectionIds?: string[],
    style?: CSSProperties,
    postMoreActionsProps?: Partial<PostMoreActionsProps>
}

export default function PostMain({post, openSubposts, postMoreActionsProps, style}: PostMainProps) {
    const {title, type, postId, deleted, author, createdAt, bannerpic, ...data} = useFragment(
        graphql`
            fragment PostMainFragment on Post {
                title
                type
                postId
                bannerpic
                createdAt
                deleted
                author {
                    firstname
                    lastname
                    userId
                    ...UserIconFragment
                }
                ...CompleteButtonFragment
                ...PostIconFragment
                ...PostActionsFragment
                ...BannerImageFragment
                ...PostMoreActionsButtonFragment
                ...PostContentFragment
                ...PostReactionsFragment
                ...PostFilesFragment
                ...PostSubheaderFragment
            }
        `,
        post
    )
    const [state, setState] = React.useState<{commentsOpen: boolean, reactionConnectionId: string, anchorEl: Anchor}>({
        commentsOpen: false,
        reactionConnectionId: '',
        anchorEl: null
    })
    const history = useHistory()

    if (deleted) {
        return (
            <div style={{paddingTop: 50, paddingBottom: 50, ...style}}>
                <Typography variant="h4" style={{fontWeight: 'bold'}}>
                    [Deleted]
                </Typography>
            </div>
        )
    }

    return (
        <div style={{position: 'relative', ...style}}>
            <div style={{position: 'relative', width: '100%'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    {
                        !!bannerpic && 
                        <BannerImage 
                            data={data} 
                            style={{objectFit: 'cover', width: '100%', height: 250, borderEndStartRadius: 10, borderEndEndRadius: 10}} 
                        />
                    }
                </div>
                <div 
                    style={{
                        position: bannerpic ? 'absolute' : 'relative',
                        bottom: -30,
                        left: 0,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                <PostIcon 
                    size={100}
                    post={data}
                />
                </div>
            </div>
            
            <CardContent style={{textAlign: 'left', marginTop: 20, position: 'relative'}}>
                <div style={{position: 'relative'}}>
                    <Typography variant="h4" style={{fontWeight: 'bold', marginRight: type === 'Task' ? 140 : 30}}>
                        {title}
                    </Typography>
                    <div style={{position: 'absolute', top: 0, right: -15, display: 'flex', alignItems: 'center'}}>
                        {
                            type === 'Task' && 
                            <CompleteButton
                                post={data}
                            />
                        } 
                        <PostMoreActionsButton
                            post={data}
                            postMoreActionsProps={postMoreActionsProps}
                        />
                    </div>
                </div>
                
                <div style={{position: 'relative', marginTop: 10, marginBottom: 10}}>
                    <div style={{position: 'absolute', left: 0}}>                    
                        <PostSubheader
                            post={data}
                            extendedDate
                        />
                    </div>
                    <div style={{height: 30}}/>
                </div>
                <PostContent
                    post={data}
                    featureProps={{
                        hideSubtasks: true
                    }}
                    hideFeatures={['Task']}
                />
                <PostFiles
                    post={data}
                />
                <PostReactions
                    post={data}
                    getConnection={(reactionConnectionId) => setState({...state, reactionConnectionId})}
                />
                <div style={{width: '100%', marginTop: 15, marginBottom: -20, }}>
                    <Divider style={{width: '100%', marginBottom: 5}}/>
                    <PostActions
                        post={data}
                        openSubposts={openSubposts}
                        style={{minHeight: state.commentsOpen ? 38 : 15}}
                        toggleComments={() => setState({...state, commentsOpen: !state.commentsOpen})}
                        reactionConnectionId={state.reactionConnectionId}
                    />
                     <Collapse in={!!state.commentsOpen} style={{width: '100%', height: 0}}>
                        <Suspense fallback={<div/>}>
                            <CommentsSection
                                postId={postId}
                                style={{marginTop: 15, paddingBottom: 10}}
                            />
                        </Suspense>
                    </Collapse>
                </div>
            </CardContent> 
        </div>
    )
}
