import { Divider } from '@material-ui/core';
import { Person } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useSelector } from 'react-redux';
import { ConnectionHandler, usePaginationFragment } from 'react-relay';
import { useHistory, useParams } from 'react-router';
import commitReorderSpaces from '../../mutations/ReorderSpaces';
import { RootState } from '../../Store';
import { space } from '../../types/space';
import { objectOrderUpdater } from '../../utils/spaceutils';
import SpaceVerticalListItem from '../Space/SpaceVerticalItem';
import SpaceVerticalList from '../Space/SpaceVerticalList';


export default function ServerBrowser({user}: any) {
    const [state, setState] = React.useState({
        hover: false,
    });

    const {data, refetch} = usePaginationFragment(    
        graphql`      
            fragment ServerBrowser_spaces on User      
            @refetchable(queryName: "ServerBrowserPaginationQuery") {
                id
                unreadDirectMessages
                unreadDirectMessagesNum
                spaces(first: $count, after: $cursor) @connection(key: "ServerBrowser_spaces") {
                    __id          
                    edges {        
                        cursor    
                        node {
                            id
                            spaceId
                            name
                            profilepic
                            currUser {
                                unreadMessages
                                unreadMessagesNum
                            }     
                        }
                    }
                }
            }
        `,
        user
    );

    const connectionID = data?.messages?.__id;

    let spaces = data.spaces.edges.map((e: any) => ({...e.node.currUser, ...e.node, currUser: undefined}));
        
    const {
        darkMode,
    } = useSelector((state: RootState) => state.uiActions);
    const history = useHistory();
    const {spaceID, roomID} = useParams<any>();

    React.useEffect(() => {
        if (!spaceID && spaces.length > 0)
            history.replace(`/messages/${spaces[0].spaceId}`)
    }, [spaceID, data])

    const onReorder = (spaceId: number, oldIndex: number, newIndex: number) => {
        const edge = data.spaces.edges.find((e: any) => e.node.spaceId === spaceId)
        commitReorderSpaces({
            variables: {
                input: {
                    spaceId,
                    oldIndex,
                    newIndex
                },
            },
            optimisticUpdater: (store: any) => objectOrderUpdater(store, edge.node.id, oldIndex, newIndex, connectionID),
            updater: (store: any) => objectOrderUpdater(store, edge.node.id, oldIndex, newIndex, connectionID),
        })
    }
   
    return (
        <div style={{height: '100%', overflow: 'auto'}}>
            <SpaceVerticalListItem
                item={{
                    spaceId: '@me',
                    icon: <Person style={{height: 45, width: 45}}/>,
                    unreadMessages: data?.unreadDirectMessages,
                    unreadMessagesNum: data?.unreadDirectMessagesNun,
                }}
                selectedItem={{
                    spaceId: spaceID
                }}
                onClick={() => history.replace(`/messages/@me`)}
            />
            <Divider style={{marginBottom: 10, marginLeft: 20, marginRight: 20}}/>
            <SpaceVerticalList
                selectedItem={{spaceId: spaceID}}
                onClick={(space: space) => {
                    history.replace(`/messages/${space.spaceId}`);
                }}
                spaces={spaces ? spaces : []}
                darkMode={darkMode}
                onReorder={onReorder}
            />
        </div>
    )
}
