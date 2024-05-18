import { environment } from '../Store'
import { ConnectionHandler, requestSubscription } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { clientId } from '../Store';

export function spaceChannelsSubscribe(  
        feedbackID: string,
        input: any,
    ) {  
    return requestSubscription(
        environment, {    
        subscription: graphql`      
            subscription SpaceChannelsSubscription($input: ChannelSubInput!) {
                spaceChannels(input: $input) {
                    roomEdge {
                        node {
                            ...ChannelListItem
                            ...RoomSettings_fragment
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
            const payload = store.getRootField('spaceChannels');

            const updatedRoom = payload.getLinkedRecord('room');
            if (updatedRoom) { // updated room, relay will handle it so do nothing
                return;
            }

            const deletedRoomId = payload.getValue('deletedRoomId');


            const spaceRecord = store.get(feedbackID);

            if (deletedRoomId) { // this is a deleted room event, remove the edge in the connection and then the record itself
                const connectionRecord = ConnectionHandler.getConnection(    
                    spaceRecord,    
                    'ChannelList_rooms',  
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

                const node = serverEdge.getLinkedRecord('node');
                const spaceClientId = node.getValue('clientId');

                if (clientId === spaceClientId)
                    return;

                if (spaceRecord) {
                    const connectionRecord = ConnectionHandler.getConnection(    
                        spaceRecord,    
                        'ChannelList_rooms',  
                    );

                    if (connectionRecord) {

                        const newEdge = ConnectionHandler.buildConnectionEdge(        
                            store,        
                            connectionRecord,        
                            serverEdge,      
                        );
                        ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge as any);
                    }
                }
            }
        },
        onCompleted: () => {},    
        onError: (error: any) => {console.log(error)},     /* Subscription errored */   
        onNext: (response: any) => {},     /* Subscription paylod received */  
    });
}