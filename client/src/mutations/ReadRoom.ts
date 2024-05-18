import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitReadRoom(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation ReadRoomMutation($input: ReadRoomInput!) {
                    readRoom(input: $input) {
                        roomUser {
                            id
                            unread
                            unreadNum
                        }
                        spaceUser {
                            id
                            unreadMessages
                            unreadMessagesNum
                        }
                        user {
                            id
                            unreadMessages
                            unreadMessagesNum
                            unreadDirectMessages
                            unreadDirectMessagesNum
                        }
                    }
                }
            `,
            ...params
        }
    );
}