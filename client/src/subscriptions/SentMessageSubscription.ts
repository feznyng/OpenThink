import { environment } from '../Store'
import { ConnectionHandler, requestSubscription } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import {clientId} from '../Store';

export function sentMessageSubscribe(  
        feedbackID: string,
        input: any,
    ) {  
    return requestSubscription(
        environment, {    
        subscription: graphql`      
            subscription SentMessageSubscription($input: MessageSubInput!, $reactionCount: Int!, $reactionCursor: String) {
                roomMessages(input: $input) {
                    messageEdge {
                        node {
                            ...MessageCard_fragment
                            clientId
                            room {
                                id
                                lastMessageAt
                            }
                        }
                    }
                    message {
                        id
                        body
                    }
                    deletedMessageId
                }
            } 
        `,    
        variables: {input, reactionCount: 20},    
        updater: (store: any) => {
            const payload = store.getRootField('roomMessages');

            const updatedMessage = payload.getLinkedRecord('message');
            if (updatedMessage) { // updated message, relay will handle it so do nothing
                return;
            }

            const deletedMessageId = payload.getValue('deletedMessageId');


            const roomRecord = store.get(feedbackID);

            if (deletedMessageId) { // this is a deleted message event, remove the edge in the connection and then the record itself

                const connectionRecord = ConnectionHandler.getConnection(    
                    roomRecord,    
                    'MessageWindowPanel_messages',  
                );

                if (connectionRecord) {
                    ConnectionHandler.deleteNode(    
                        connectionRecord,    
                        deletedMessageId,  
                    );
                    store.delete(deletedMessageId);

                }
                return;
            }
            const serverEdge = payload.getLinkedRecord('messageEdge');

            if (serverEdge) { // this is a sent message event, add the edge to the connection in the room 
                const node = serverEdge.getLinkedRecord('node');
                const messageClientId = node.getValue('clientId');

                if (clientId === messageClientId)
                    return;
                
                if (roomRecord) {
                    const connectionRecord = ConnectionHandler.getConnection(    
                        roomRecord,    
                        'MessageWindowPanel_messages',  
                    );

                    if (connectionRecord) {

                        const newEdge = ConnectionHandler.buildConnectionEdge(        
                            store,        
                            connectionRecord,        
                            serverEdge,      
                        );
                        ConnectionHandler.insertEdgeBefore(connectionRecord, newEdge as any);
                    }
                }
            }
        },
        onCompleted: () => {},    
        onError: (error: any) => {console.log(error)},     /* Subscription errored */   
        onNext: (response: any) => {},     /* Subscription paylod received */  
    });
}