import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitSendMessage(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation SendMessageMutation($connections: [ID!]!, $input: SendMessageInput!, $reactionCount: Int!, $reactionCursor: String) {
                    sendMessage(input: $input) {
                        messageEdge @prependEdge(connections: $connections) {
                            node {
                                ...MessageCard_fragment
                                body
                                clientId
                                createdAt
                            }
                        }
                    }
                }
            `,
            variables: {
                ...params.variables,
                reactionCount: 20
            },
            ...params,
        }
    );
}