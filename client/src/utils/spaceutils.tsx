import { Lock, LockOpen, Public, Visibility, VisibilityOff, VpnKey } from '@material-ui/icons';
import Fuse from 'fuse.js';
import { ConnectionHandler } from 'relay-runtime';

export const spaceFuse = new Fuse([], {
    keys: [
        "name",
        "description",
    ]
});

export const accessTypes = [
    {
        title: 'Open',
        icon: <LockOpen/>,
        desc: 'Anyone can join this'
    },
    {
        title: 'Restricted',
        icon: <VpnKey/>,
        desc: 'People must request to join this'
    },
    {
        title: 'Closed',
        icon: <Lock/>,
        desc: 'People must be invited to join this'
    },
]

export const visibilityTypes = [
    {
        title: 'Public',
        icon: <Public/>,
        desc: 'Anyone can find this'
    },
    {
        title: 'Closed',
        icon: <Visibility/>,
        desc: 'Only members of parent groups can see this'
    },
    {
        title: 'Private',
        icon: <VisibilityOff/>,
        desc: 'Only invitees can see this'
    },
]

export const objectOrderUpdater = (store: any, id: string, oldIndex: number, newIndex: number, connectionID: string) => {
    const connection = store.get(connectionID);

    if (connection) {
        const edges = connection.getLinkedRecords('edges')
        if (edges) {
            let nodeId = null;
            const spaceEdge = edges?.find((s: any) => {
                const node = s.getLinkedRecord('node');
                nodeId = node?.getDataID();
                return id === nodeId
            })

            const nextEdge = edges[newIndex];
            if (spaceEdge && nextEdge && nodeId) {
                const nextEdgeCursor = nextEdge.getValue('cursor');
                ConnectionHandler.deleteNode(connection, nodeId)

                if (oldIndex < newIndex) {
                    ConnectionHandler.insertEdgeAfter(connection, spaceEdge, nextEdgeCursor as string);
                } else {
                    ConnectionHandler.insertEdgeBefore(connection, spaceEdge, nextEdgeCursor as string);
                }
            }
        }
    }
}