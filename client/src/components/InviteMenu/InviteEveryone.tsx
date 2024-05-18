import React, { Suspense } from 'react'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Typography from '../Shared/Typography';
import RoundedTextField from '../Shared/RoundedTextField';
import SearchUserResults from '../User/SearchUserResults';
import SearchLoader from '../Shared/SearchLoader';
import { InviteUserProps } from './InviteConnections';
import { INVITE_MENU_HEIGHT } from './InviteMenuDialog';
import ConnectionsList from '../User/ConnectionsList';

export default function InviteEveryone({space, userIds, user, onUserSelect}: InviteUserProps) {
    const spaceData = useFragment(
        graphql`
            fragment InviteEveryoneFragment_space on Space {
                spaceId,
                ...SearchUserResults_space
            }
        `,
        space ? space : null
    )

    const me = useFragment(
        graphql`
            fragment InviteEveryoneFragment_user on User {
                ...ConnectionsListFragment
            }
        `,
        user
    )
    
    const [state, setState] = React.useState({
        query: ''
    })

    const userListProps = {
        listItemProps: {
            onSelect: onUserSelect,
        },
        selectedIds: userIds,
    }


    return (
        <div>
            <RoundedTextField
                placeholder='Search Users'
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
                    <div>
                        <Typography variant='subtitle2'>
                            Connections
                        </Typography>
                        <ConnectionsList
                            user={me}
                            {...userListProps}
                        />
                    </div>
                    :
                    <Suspense
                        fallback={<SearchLoader/>}
                    >
                        <SearchUserResults
                            query={state.query}
                            space={spaceData}
                            {...userListProps}
                        />
                    </Suspense>
                }
            </div>
        </div>
    )
}
