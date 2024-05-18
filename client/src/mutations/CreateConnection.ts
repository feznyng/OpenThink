import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitCreateConnection(
    params: any,
) {
    console.log(params)
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation CreateConnectionMutation($input: CreateConnectionInput!) {
                    createConnection(input: $input) {
                        userId
                        id
                        connection {
                            id
                            connectionId
                            user1Id
                            user2Id
                            accepted
                        }
                    }
                }
            `,
            ...params
        }
    );
}