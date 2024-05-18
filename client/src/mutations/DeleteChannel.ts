import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitDeleteChannel(
    params: any,
) {
    console.log(params)
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation DeleteChannelMutation($connections: [ID!]!, $input: DeleteRoomInput!) {
                    deleteRoom(input: $input) {
                        deletedRoomId @deleteEdge(connections: $connections)
                    }
                }
            `,
            ...params
        }
    );
}