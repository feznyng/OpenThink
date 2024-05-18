import { commitLocalUpdate } from 'react-relay';
import { environment } from '../Store';

export function commitMessageNotification(
  message: any,
) {
    return commitLocalUpdate(
        environment, 
        (store: any) => {
            // update room 
            const roomRecord = store.get(message.room_graphql_id);
            if (roomRecord) { // update the room's notification
                const currUserRecord = roomRecord.getLinkedRecord("currUser");
                if (currUserRecord) {
                    currUserRecord.setValue(true, "unread")
                }
            }

            // update space 
            const spaceRecord = store.get(message.space_graphql_id);
            if (spaceRecord) { // update the space's notification
                const currUserRecord = spaceRecord.getLinkedRecord("currUser");
                if (currUserRecord) {
                    currUserRecord.setValue(true, "unreadMessages")
                }
            }

            // update user
            const user = store.getRoot().getLinkedRecord('me');
            if (user) {
                user.setValue(true, 'unreadMessages')
            }
        }
    );
}