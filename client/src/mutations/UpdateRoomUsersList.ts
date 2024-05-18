import { commitLocalUpdate, ConnectionHandler } from 'react-relay';
import { environment } from '../Store';

// user has become active


// try to find roomUserEdge in inactiveUsers and link to activeUsers
export function commitActiveUser(
  feedbackID: string,
  userId: string,
  refreshLists: () => void
) {
    return commitLocalUpdate(
        environment, 
        (store: any) => {
            const roomRecord = store.get(feedbackID);
            if (roomRecord) {

                const activeConnectionRecord = ConnectionHandler.getConnection(
                    roomRecord,    
                    'UsersList_activeUsers',  
                );
    
                const inactiveConnectionRecord = ConnectionHandler.getConnection(
                    roomRecord,    
                    'UsersList_inactiveUsers',  
                );
                
                const inactiveEdges = inactiveConnectionRecord?.getLinkedRecords("edges")
                const inactiveEdge = inactiveEdges?.find(e => {
                    const node = e.getLinkedRecord('node')
                    const user = node?.getLinkedRecord('user')
                    const user_id = user?.getValue('userId');
                    return user_id === userId.toString()
                })

                if (inactiveEdge) {
                    const id = inactiveEdge?.getLinkedRecord('node')?.getDataID();
                    ConnectionHandler.insertEdgeBefore(activeConnectionRecord!!, inactiveEdge as any);
                    ConnectionHandler.deleteNode(inactiveConnectionRecord!!, id as any);
                } else { // either the user wasn't fetched before or it doesn't exist within the current room
                    refreshLists();
                }
            }
        }
    );
}

export function commitInactiveUser(
    feedbackID: string,
    userId: string,
    refreshLists: () => void
  ) {
      return commitLocalUpdate(
        environment, 
          (store: any) => {
              const roomRecord = store.get(feedbackID);
              if (roomRecord) {
  
                  const activeConnectionRecord = ConnectionHandler.getConnection(
                      roomRecord,    
                      'UsersList_inactiveUsers',  
                  );
      
                  const inactiveConnectionRecord = ConnectionHandler.getConnection(
                      roomRecord,    
                      'UsersList_activeUsers',  
                  );
                  
                  const inactiveEdges = inactiveConnectionRecord?.getLinkedRecords("edges")
                  const inactiveEdge = inactiveEdges?.find(e => {
                      const node = e.getLinkedRecord('node')
                      const user = node?.getLinkedRecord('user')
                      const user_id = user?.getValue('userId');
                      return user_id === userId.toString()
                  })  
  
                  if (inactiveEdge) {
                      const id = inactiveEdge?.getLinkedRecord('node')?.getDataID();
                      ConnectionHandler.insertEdgeBefore(activeConnectionRecord!!, inactiveEdge as any);
                      ConnectionHandler.deleteNode(inactiveConnectionRecord!!, id as any);
                  } else { // generate new edge as this is a user that hasn't show up before
                    refreshLists();
                  }
              }
          }
      );
  }

  export function commitSyncUsers(
    feedbackID: string,
    presences: any[],
  ) {
      return commitLocalUpdate(
        environment, 
          (store: any) => {
              const roomRecord = store.get(feedbackID);
              if (roomRecord) {
                  const connectionRecord = ConnectionHandler.getConnection(
                      roomRecord,    
                      'UsersList_users',  
                  );

                  const edges = connectionRecord?.getLinkedRecords("edges")

                  edges?.forEach(e => {
                        const node = e.getLinkedRecord('node');
                        const user = node?.getLinkedRecord('user')
                        if (presences.find(p => p.user.user_id.toString() === user?.getValue("userId")?.toString())) {
                            user?.setValue(true, "active")
                        } else {
                            user?.setValue(false, "active")
                        }
                  })
              }
          }
      );
  }