import React, { useRef } from 'react'
import { usePreloadedQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { WikiPostViewQuery } from './__generated__/WikiPostViewQuery.graphql';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import TextField from '../Shared/TextField';
import { onPostChange } from './WikiSlice';
import Button from '../Shared/Button';
import { Image } from '@material-ui/icons';
import { Fade } from '@mui/material';
import { useAppSelector } from '../../Store';
import PostContentEditor from '../Post/PostContentEditor';
import PostView from '../DatabaseViews/PostView';

interface WikiPostViewProps {
    style?: React.CSSProperties,
    queryRef: any
}

export default function WikiPostView({style, queryRef}: WikiPostViewProps) {
    const [focused, setFocused] = React.useState(false)
    const [state, setState] = React.useState<any>({
        loading: false,
        hover: false,
    })

    let titleInput = React.useRef();
    const {post} = usePreloadedQuery<WikiPostViewQuery>(
        graphql`
            query WikiPostViewQuery($postId: ID!) {
                post(postId: $postId) {
                    postId
                    title
                    delta
                }
            }
        `,
        queryRef
    )
    
    const titleRef = useRef()

    const currPost = useAppSelector(state => state.wiki.posts[post!!.postId!!])

    const onChange = (delta: any) => {
        setState({
            ...state,
            delta
        })
        onPostChange({postId: post?.postId!!, delta}, false)
    }

    const onTitleChange = (title: string) => {
        onPostChange({postId: post?.postId!!, title})
    }

    return (
        <div style={{...style, width: '100%', marginTop: 20}}>
           <MaxWidthWrapper
                width={950}
            >
                <PostView
                    postId={post!!.postId!!}
                    content={currPost?.delta ? currPost.delta : null}
                    title={currPost?.title ? currPost.title : ''}
                    onContentChange={onChange}
                    onTitleChange={onTitleChange}
                    contentLoaded={!state.loading}
                    titleProps={{
                        placeholder: 'Untitled',
                        InputProps: {
                            style: {fontSize: 40, fontWeight: 550}
                        },
                        style: {paddingLeft: 75, paddingRight: 75},
                        size: 'small',
                        variant: 'plain',
                    }}
                    contentProps={{
                        variant: 'plain',
                        placeholder: 'Add more detail to this task',
                        extended: true
                    }}
                />
            </MaxWidthWrapper>
        </div>
    )
}
