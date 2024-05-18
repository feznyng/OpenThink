import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitVotePost(
    postId: number,
    spaceId: number,
    upvote: boolean,
    params: any = {},
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation VotePostMutation($input: VotePostInput!) {
                    votePost(input: $input) {
                        myVote {
                            id
                            postVoteId
                            vote
                        }
                        post {
                            id
                            numDownvotes
                            numUpvotes
                            voteValue
                        }
                    }
                }
            `,
            variables: {
                input: {
                    postId,
                    spaceId,
                    upvote
                }
            },
            ...params
        }
    );
}