import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitSetCurrentPage(
    params: any,
) {
    console.log(params)
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation SetCurrentPageMutation($input: CurrentPageInput!) {
                    setCurrentPage(input: $input) {
                        id
                        currentPage
                    }
                }
            `,
            ...params
        }
    );
}