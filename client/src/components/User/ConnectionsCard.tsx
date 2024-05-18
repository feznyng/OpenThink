import React from 'react'
import { connection, user } from '../../types/user'
import ImageList from '@material-ui/core/ImageList';
import { Button, Card, CardContent, CardHeader, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import Typography from '../Shared/Typography'
import { useHistory } from 'react-router';
import UserCard from './UserCard';
import { getUserConnections } from '../../actions/connectionActions';
import { useSelector } from 'react-redux';
import { RootState, useAppSelector } from '../../Store';
import { primaryColor } from '../../theme';
import { useFragment, usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import UserList from './UserList';

interface ConnectionsCardProps {
    user: any,
    style?: React.CSSProperties,
    expanded?: boolean
}

export default function ConnectionsCard({style, user}: ConnectionsCardProps) {
    const {data, loadNext} = usePaginationFragment(
        graphql`
            fragment ConnectionsCardFragment on User 
            @refetchable(queryName: "ConnectionCardPaginationQuery") {
                connections(first: $connectionCount, after: $connectionCursor) @connection(key: "ConnectionsCardFragment_connections") {
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        user
    )

    const history = useHistory();

    return (
        <Card style={{width: "100%", textAlign: 'left', ...style}}>
            <CardHeader
                title={"Connections"}
                titleTypographyProps={{variant: 'h6'}}
            />
            <CardContent style={{marginTop: -20}}>
                <UserList
                    users={data.connections}
                    loadMore={() => loadNext(20)}
                />
            </CardContent>
        </Card>
    )
}
