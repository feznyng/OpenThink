import React, { Suspense } from 'react'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import RoundedTextField from '../Shared/RoundedTextField';
import ConnectionsSearchResults from '../User/ConnectionsSearchResults';
import SearchLoader from '../Shared/SearchLoader';
import { INVITE_MENU_HEIGHT } from './InviteMenuDialog';
import ConnectionsList from '../User/ConnectionsList';

export interface InviteUserProps {
    space?: any,
    user: any,
    userIds: number[],
    onUserSelect: (userId: number) => void
}

interface InviteConnectionsState {
    query: string,
}

const connectionCount = 20;

export default function InviteConnections({space, user, userIds, onUserSelect}: InviteUserProps) {
    const {spaceId, ...results} = useFragment(
        graphql`
            fragment InviteConnectionsFragment_space on Space {
                spaceId
                ...ConnectionsSearchResultsFragment_space
            }
        `,
        space
    )

    const data = useFragment(
        graphql`
            fragment InviteConnectionsFragment_user on User {
                ...ConnectionsSearchResultsFragment_user
                ...ConnectionsListFragment
                userId
            }
        `,
        user
    )

    const userListProps = {
        userListItemProps: {
            onSelect: onUserSelect,
        },
        selectedUserIds: userIds,
    }

    const [state, setState] = React.useState<InviteConnectionsState>({
        query: '',
    })

    return (
        <div>
            <RoundedTextField
                placeholder='Search Connections'
                size='small'
                fullWidth
                onChange={(e) => setState({...state, query: e.target.value})}
            />
            <div
                style={{marginTop: 15, height: INVITE_MENU_HEIGHT, overflow: 'auto'}}
                id="scrollableDiv"
            >
                {
                    state.query.length === 0 ? 
                    <ConnectionsList
                        user={data}
                        {...userListProps}
                    />
                    :
                    <Suspense
                        fallback={<SearchLoader/>}
                    >
                        <ConnectionsSearchResults
                            user={data}
                            space={results}
                            query={state.query}
                            {...userListProps}
                        />
                    </Suspense>
                    
                }
            </div>
        </div>
    )
}
