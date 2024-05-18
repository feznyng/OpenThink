import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import UserIcon from './UserIcon';
import Typography from '../Shared/Typography';
import { Tooltip } from '@mui/material';
import UserPreview from './UserPreview';

interface UserStackProps {
    users: any,
    type: string,
    showName?: boolean
}

export default function UserStack({users, showName, type}: UserStackProps) {
    const {edges} = useFragment(
        graphql`
            fragment UserStackFragment on UserConnection {
                edges {
                    node {
                        userId
                        ...UserIconFragment
                    }
                }
            }
        `,
        users
    )

    return (
        <span>
            {
                edges.length > 0 ?
                <span style={{display: 'flex', alignItems: 'center'}}>
                    {
                        edges.map(({node}: any) => (
                            <span style={{marginRight: -5}}>
                                <UserIcon
                                    user={node}
                                    size={25}
                                    showName
                                />
                            </span>
                        ))
                    }
                </span>
                :
                <Typography>
                    No {type}s
                </Typography>
            }
        </span>
    )
}
