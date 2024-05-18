import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitDeleteReaction(
    reactionId: number,
    connections: string[] = [],
    params: any = {},
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation DeleteReactionMutation($input: DeleteReactionInput!, $connections: [ID!]!) {
                    deleteReaction(input: $input) {
                        deletedReactionId @deleteEdge(connections: $connections)
                        reaction {
                            id
                            ...ReactionChipFragment
                        }
                    }
                }
            `,
            variables: {
                input: {
                    reactionId
                },
                connections
            },
            ...params
        }
    );
}