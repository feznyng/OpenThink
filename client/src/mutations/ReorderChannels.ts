import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitReorderChannels(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation ReorderChannelsMutation($input: ChannelOrderChange!) {
                   reorderSpaceChannels(input: $input) {
                       id
                       index
                   }
                }
            `,
            ...params
        }
    );
}