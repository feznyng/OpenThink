import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';
import { BatchDeletePostInput } from './__generated__/BatchDeletePostMutation.graphql';

export default function commitBatchDeletePost(
    input: BatchDeletePostInput,
    connections: string[] = [],
    params: any = {},
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation BatchDeletePostMutation($input: BatchDeletePostInput!, $connections: [ID!]!) {
                    batchDeletePost(input: $input) {
                        deletedPostId @deleteEdge(connections: $connections)
                    }
                }
            `,
            variables: {
                input: {
                    ...input,
                    deleteRelations: input.deleteRelations ? input.deleteRelations : false
                },
                connections: connections ? connections : [],
            },
            ...params,
        }
    );
}