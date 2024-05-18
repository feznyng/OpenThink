import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';
import { DeletePostInput } from './__generated__/DeletePostMutation.graphql';

export default function commitDeletePost(
    input: Partial<DeletePostInput>,
    connections: string[] = [],
    params: any = {},
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation DeletePostMutation($input: DeletePostInput!, $connections: [ID!]!) {
                    deletePost(input: $input) {
                        deletedPostId @deleteEdge(connections: $connections)
                        deletedPost {
                            id
                            deleted
                        }
                    }
                }
            `,
            variables: {
                input: {
                    ...input,
                    deleteRelations: input.deleteRelations ? input.deleteRelations : false
                },
                connections: connections ? connections : []
            },
            ...params,
        }
    );
}