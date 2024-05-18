import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitDeleteConnection(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation DeleteConnectionMutation($input: DeleteConnectionInput!) {
                    deleteConnection(input: $input) {
                        id
                        user1Id
                        user2Id
                        accepted
                        connectionId
                    }
                }
            `,
            ...params
        }
    );
}