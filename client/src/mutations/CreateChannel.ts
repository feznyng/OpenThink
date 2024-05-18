import graphql from 'babel-plugin-relay/macro';
import { commitMutation } from 'react-relay';
import { environment } from '../Store';

export default function commitCreateChannel(
    params: any,
) {
    return commitMutation(
        environment, 
        {
            mutation: graphql`
                mutation CreateChannelMutation($connections: [ID!]!, $input: CreateRoomInput!) {
                    createRoom(input: $input) {
                        roomEdge @appendEdge(connections: $connections) {
                            node {
                                ...SpaceChannelListItemFragment
                                ...ChannelListItem
                                id
                                name
                                spaceId
                                roomId
                                type
                                currUser {
                                    unread
                                    unreadNum
                                }
                                users(first: 20) {
                                edges {
                                    node{
                                        roomUserId
                                        user {
                                            userId
                                            firstname
                                            lastname
                                            profilepic
                                        }
                                    }
                                }
                            }
                            }
                        }
                    }
                }
            `,
            ...params
        }
    );
}