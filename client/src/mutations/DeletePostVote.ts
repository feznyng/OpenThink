import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitDeletePostVote(
    postVoteId: number,
    params: any = {},
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation DeletePostVoteMutation($input: DeleteVotePostInput!) {
                    deleteVotePost(input: $input) {
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
                    postVoteId
                }
            },
            ...params,
            onCompleted: (response: any) => {
                console.log(response.deleteVotePost.post)
            }
        }
    );
}