import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { MAX_REACTIONS, MAX_TAGS } from '../constants';
import { environment } from '../Store';
import { CreatePostMutation } from './__generated__/CreatePostMutation.graphql';
import { PostInput } from './__generated__/UpdatePostMutation.graphql';

export const defaultPostCardArgs = {
    tagCount: MAX_TAGS,
    reactionCount: MAX_REACTIONS,
    taskCount: 20
}

export default function commitCreatePost(
    post: PostInput,
    connections: string[] = [],
    params: any = {},
) {
    return commitMutation<CreatePostMutation>(
        environment, 
        {
            mutation: graphql`
                mutation CreatePostMutation($input: PostInput!, $spaceId: Int!, $connections: [ID!]!, $reactionCount: Int!, $reactionCursor: String, $tagCount: Int!, $tagCursor: String) {
                    createPost(input: $input) {
                        postEdge @prependEdge(connections: $connections) {
                            node {
                                ...PostCardFragment
                                postId
                                title
                                type
                            }
                        }
                    }
                }
            `,
            variables: {
                input: {
                    ...post,
                    delta: post.delta ? JSON.stringify(post.delta) : null
                },
                connections: connections ? connections : [],
                ...defaultPostCardArgs,
                spaceId: post?.spaces ? post?.spaces[0]?.spaceId : null
            },
            ...params,
        }
    );
}