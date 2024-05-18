import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitAddReaction(
    id: number,
    spaceId: number,
    emoji: string,
    name: string,
    type: string,
    connections: string[] = [],
    params: any = {},
) {
    const ids = type === 'message' ? {messageId: id} : {postId: id}

    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation AddReactionMutation($input: AddReactionInput!, $connections: [ID!]!) {
                    addReaction(input: $input) {
                        newReaction @appendEdge(connections: $connections) {
                            cursor
                            node {
                                id
                                ...ReactionChipFragment
                            }
                        }
                        reaction {
                            id
                            ...ReactionChipFragment
                        }
                    }
                }
            `,
            variables: {
                input: {
                    ...ids,
                    spaceId,
                    emoji,
                    name
                },
                connections
            },
            ...params
        }
    );
}