import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitCreateSpace(
    space: any,
    connections: string[],
    params?: any
) {

    console.log(space, connections)
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation CreateSpaceMutation($connections: [ID!]!, $input: CreateSpaceInput!) {
                    createSpace(input: $input) {
                        spaceEdge @prependEdge(connections: $connections) {
                            node {
                                spaceId
                                ...SpaceListItemFragment
                                ...SpaceCardFragment
                            }
                        }
                    }
                }
            `,
            ...params,
            variables: {
                input: space,
                connections,
            },
        }
    );
}