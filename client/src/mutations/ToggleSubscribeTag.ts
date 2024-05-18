import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitToggleSubscribeTag(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation ToggleSubscribeTagMutation($input: SubscribeTag!) {
                    toggleSubscribeTag(input: $input) {
                        id
                        userTagId
                    }
                }
            `,
            ...params
        }
    );
}