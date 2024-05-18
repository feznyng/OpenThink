
import { usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import ConnectionsCard from './ConnectionsCard';
import { UserProjectsQuery } from './__generated__/UserProjectsQuery.graphql';

interface UserConnectionsProps {
  queryRef: any
}

export default function UserConnections({queryRef}: UserConnectionsProps) {
  const {user} = usePreloadedQuery<UserProjectsQuery>(
    graphql`
        query UserConnectionsQuery($userId: ID!, $connectionCount: Int!, $connectionCursor: String) {
            user(userId: $userId) {
                ...ConnectionsCardFragment
            }
        }
    `,
    queryRef
)

  return (
    <div style={{display: 'flex', justifyContent: 'center', height: '100%', marginTop: 15}}>
        <div style={{maxWidth: 900, width: '100%'}}>
            <ConnectionsCard
              user={user}
              expanded
            />
        </div>
    </div>
  )
}