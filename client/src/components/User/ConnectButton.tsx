import { ButtonProps, Menu, MenuItem } from '@material-ui/core'
import { Person, PersonAdd } from '@material-ui/icons'
import React from 'react'
import Button from '../Shared/Button'
import { useFragment, useLazyLoadQuery, usePreloadedQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import commitDeleteConnection from '../../mutations/DeleteConnection'
import commitCreateConnection from '../../mutations/CreateConnection'
import { ConnectButtonQuery } from './__generated__/ConnectButtonQuery.graphql'


interface ConnectButtonProps {
    userData: any,
    style?: React.CSSProperties,
}

interface ConnectButtonState {
    anchorEl?: null | Element
}

export default function ConnectButton(props: ConnectButtonProps & Partial<ButtonProps>) {
    const {
        userData,
        style
    } = props;


    const {userId, connection} = useFragment(
        graphql`      
            fragment ConnectButtonFragment_connection on User { 
                userId
                connection {
                    id
                    connectionId
                    user1Id
                    user2Id
                    accepted
                }
            }
        `,    
        userData
    );

    const [state, setState] = React.useState<ConnectButtonState>({
        anchorEl: null
    })


    const {me} = useLazyLoadQuery<ConnectButtonQuery>(
        graphql`      
            query ConnectButtonQuery {
                me {
                    userId
                }
            }
        `,
        {}, 
    );

    const handleClick = (e: React.MouseEvent) => {
        if (connection) {
            if (connection.accepted) {
                setState({
                    ...state,
                    anchorEl: e.currentTarget
                })
            } else if (connection.connectionId) {
                deleteConnection()
            } else {
                commitCreateConnection({
                    variables: {
                        input: {
                            user1Id: me?.userId,
                            user2Id: parseInt(userId)
                        }
                    }
                })
            }
        }
    }

    const deleteConnection = () => {
        commitDeleteConnection({
            variables: {
                input: {
                    userId,
                }
            }
        })
    }

    const loading = false;
    
    return (
        <div style={style}>
            <Button
                {...props}
                color="primary"
                variant="contained"
                loading={loading}
                onClick={handleClick}
                startIcon={(connection?.connectionId && connection.accepted) ? <Person/> : <PersonAdd/>}
            >
                {connection?.connectionId ? (connection.accepted ? 'Connected' : 'Requested') : ('Connect')}
            </Button>

            <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                <MenuItem
                    onClick={() => {setState({...state, anchorEl: null}); deleteConnection()}}
                >
                    Remove Connection
                </MenuItem>
            </Menu>
        </div>
    )
}
