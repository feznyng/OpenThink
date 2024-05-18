import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';
import { InviteSpaceUsersMutation } from './__generated__/InviteSpaceUsersMutation.graphql';

export default function commitInviteSpaceUsers(
    params?: any,
) {
    return commitMutation<InviteSpaceUsersMutation>(
        environment, 
        {
            mutation: graphql`
                mutation InviteSpaceUsersMutation($input: InviteUsersSpaceInput!) {
                    inviteUsersSpace(input: $input) {
                        userEdges {
                            node {
                                ...UserListItemFragment
                            }
                        }
                    }
                }
            `,
            ...params
        },
    );
}