import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitReorderSpaces(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation ReorderSpacesMutation($input: SpaceOrderChange!) {
                   reorderUserSpaces(input: $input) {
                       id
                       index
                   }
                }
            `,
            ...params
        }
    );
}