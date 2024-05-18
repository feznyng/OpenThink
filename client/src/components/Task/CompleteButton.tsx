import { Done } from '@material-ui/icons';
import React, { CSSProperties } from 'react';
import Button from '../Shared/Button';
import { completeColor } from '../../constants';
import { useFragment, useMutation } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import CompleteButtonBase from './CompleteButtonBase';
import { CompleteButtonMutation } from './__generated__/CompleteButtonMutation.graphql' 
import { useAppDispatch } from '../../Store';
import { editPostById } from './TaskSlice';
interface CompleteButtonProps {
    post: any,
    style?: CSSProperties
}

export default function CompleteButton({post, style}: CompleteButtonProps) {
    const {postId, completed, type} = useFragment(
        graphql`
            fragment CompleteButtonFragment on Post {
                postId
                completed
                type
            }
        `,
        post
    )

    const [commitComplete, loading] = useMutation<CompleteButtonMutation>(
        graphql`
            mutation CompleteButtonMutation($input: PostInput!) {
                updatePost(input: $input) {
                    postEdge {
                        node {
                            postId
                            completed
                        }
                    }
                }
            }
        `
    )

    const dispatch = useAppDispatch()

    const onComplete = () => {
        commitComplete({
            variables: {
                input: {
                    postId,
                    type,
                    completed: !completed
                }
            },
            onCompleted: ({updatePost}) => {
                const post = updatePost?.postEdge?.node
                if (post?.postId)
                    dispatch(editPostById({postId: post.postId.toString(), post}))
            }
        })
    }

    return (
        <CompleteButtonBase
            completed={completed}
            onClick={onComplete}
            style={style}
            loading={loading}
        />
    )
}