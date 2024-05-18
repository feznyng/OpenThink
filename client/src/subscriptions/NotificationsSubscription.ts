import { environment } from '../Store'
import { ConnectionHandler, requestSubscription } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import {clientId} from '../Store';
import { NewNotificationsSubInput } from './__generated__/NotificationsSubscription.graphql';

export function newNotificationSubscribe(  
        input: NewNotificationsSubInput,
        connectionId?: string, 
        userId?: string
    ) {  
    return requestSubscription(
        environment, {    
        subscription: graphql`      
            subscription NotificationsSubscription($input: NewNotificationsSubInput!, $connections: [ID!]!) {
                newNotification(input: $input) {
                    edge @prependEdge(connections: $connections) {
                        node {
                            ...NotificationListItemFragment
                        }
                    }
                }
            } 
        `,    
        variables: {input, connections: connectionId ? [connectionId] : []},
        updater: (store) => {
            if (userId) {
                const meRecord = store.get(userId)
                let notificationsNum = meRecord?.getValue('notificationsNum') as number
                notificationsNum = notificationsNum ? notificationsNum : 0
                meRecord?.setValue(notificationsNum + 1, "notificationsNum", {read: false})
            }
        },
        onNext: (val) => console.log(val)
    });
}