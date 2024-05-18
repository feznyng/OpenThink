import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { MAX_REACTIONS, MAX_TAGS } from '../constants';
import { environment } from '../Store';

export default function commitUpdatePost(
    post: any,
    params: any = {}
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation UpdatePostMutation($input: PostInput!, $spaceId: Int, $tagCount: Int!, $tagCursor: String) {
                    updatePost(input: $input) {
                        postEdge {
                            node {
                                id
                                postId
                                priority
                                dueDate
                                users(userTypes: ["Assignee"], first: 5) {
                                    edges {
                                        node {
                                            userId
                                            firstname
                                            lastname
                                            profilepic
                                        }
                                    }
                                }
                                title
                                ...PostContentFragment
                                ...PostFilesFragment
                                ...PostCardHeaderFragment
                            }
                        }
                    }
                }
            `,
            variables: {
                input: {
                    ...post,
                    delta: post.delta ? JSON.stringify(post.delta) : null,
                },
                tagCount: MAX_TAGS,
                reactionCount: MAX_REACTIONS,
                taskCount: 20,
            },
            ...params
        }
    );
}