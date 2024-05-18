import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

interface UserPrefs {
    darkMode?: boolean,
    productivityView?: boolean
}

export default function commitUpdateUserPrefs(
    input: UserPrefs,
    params?: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation UpdateUserPrefsMutation($input: ChangePrefsInput!) {
                    changePreferences(input: $input) {
                        id
                        ...DisplayOptionsFragment

                    }
                }
            `,
            ...params,
            variables: {
                input
            }
        }
    );
}