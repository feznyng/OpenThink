import {environment} from '../Store'
import { ConnectionHandler, requestSubscription } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { clientId } from '../Store';

export function userDmSubscribe(  
        feedbackID: string,
        input: any,
    ) {  
    return requestSubscription(
        environment, {    
        subscription: graphql`      
            subscription UserDMSubscription($input: UserDmSubInput!) {
                directMessages(input: $input) {
                    roomEdge {
                        node {
                            ...ChannelListItem
                            ...RoomSettings_fragment
                            currUser {
                                unread
                            }
                        }
                    }
                    room {            
                        id
                        name
                        description
                        type
                        visibility
                    }
                    deletedRoomId
                    clientId
                }
            } 
        `,    
        variables: {input},    
        updater: (store: any) => {
            
            const payload = store.getRootField('directMessages');

            const updatedRoom = payload.getLinkedRecord('room');
            
            if (updatedRoom) { // updated room, relay will handle it so do nothing
                console.log('updated room')
                return;
            }

            const deletedRoomId = payload.getValue('deletedRoomId');


            const userRecord = store.get(feedbackID);

            if (deletedRoomId) { // this is a deleted room event, remove the edge in the connection and then the record itself
                console.log('deleted room')
                const connectionRecord = ConnectionHandler.getConnection(    
                    userRecord,    
                    'DirectMessagesList_directMessages',  
                );

                if (connectionRecord) {
                    ConnectionHandler.deleteNode(    
                        connectionRecord,    
                        deletedRoomId,  
                    );
                }
                store.delete(deletedRoomId);
                return;
            }
            const serverEdge = payload.getLinkedRecord('roomEdge');

            if (serverEdge) { // this is a new room, add the edge to the connection in the room
                console.log('created room edge')
                const node = serverEdge.getLinkedRecord('node');
                const spaceClientId = node.getValue('clientId');

                if (clientId === spaceClientId)
                    return;

                console.log('user record', userRecord)
                if (userRecord) {
                    const connectionRecord = ConnectionHandler.getConnection(    
                        userRecord,    
                        'DirectMessagesList_directMessages',  
                    );

                    console.log('connection record', connectionRecord)
                    if (connectionRecord) {
                        const currUser = node.getLinkedRecord('currUser');
                        console.log(currUser)
                        currUser?.setValue(true, "unread")
                        const newEdge = ConnectionHandler.buildConnectionEdge(        
                            store,        
                            connectionRecord,        
                            serverEdge,      
                        );

                        console.log('adding new edge', newEdge)
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