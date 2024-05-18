import { ButtonProps, Menu, MenuItem } from '@material-ui/core'
import { Person, PersonAdd } from '@material-ui/icons'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createConnection, deleteConnection } from '../../actions/connectionActions'
import { RootState } from '../../Store'
import { connection, user } from '../../types/user'
import {createNotification} from '../../actions/notificationActions';
import Button from '../Shared/Button'


interface ConnectButtonProps {
    user: user & connection,
    style?: React.CSSProperties,
}

interface ConnectButtonState {
    connection: connection;
    removingConnection: boolean;
    loading: boolean;
    anchorEl?: null
}

export default function ConnectButton(props: ConnectButtonProps & Partial<ButtonProps>) {
    const {
        user,
        style
    } = props
    const {
        userInfo
    } = useSelector((state: RootState) => state.userActions);
    const [state, setState] = React.useState<ConnectButtonState>({
        connection: user.connection ? user.connection : {
            user1_id: user.user1_id,
            user2_id: user.user2_id,
        },
        removingConnection: false,
        loading: false,
    });

    const handleClick = (e: any) => {
        if (state.connection.connection_id) {
            if (state.connection.accepted) {
                setState({
                    ...state,
                    anchorEl: e.currentTarget
                })
            } else {
                deleteUserConnection();
            }
        } else {
            setState({
                ...state,
                loading: true,
            });
            (createConnection({user1_id: userInfo.user_id, user2_id: user.user_id})).then(connection => {
                createNotification(user.user_id, {
                    type: 'connection request',
                    read: false,
                    connection_id: connection.connection_id,
                    description: `${userInfo.firstname} wants to connect with you.`,
                })
                if (connection) {
                    setState({
                        ...state,
                        connection: {...state.connection, ...connection},
                        loading: false
                    })
                } else {
                    setState({
                        ...state,
                        loading: false
                    })
                }
                
            })
        }
    }

    const deleteUserConnection = () => {
        if (state.connection.connection_id) {
            setState({
                ...state,
                loading: true,
            });
            (deleteConnection(state.connection.connection_id)).then(() => {
                setState({
                    ...state,
                    connection: {
                        accepted: false,
                        connection_id: null,
                        created_at: null,
                    },
                    loading: false
                })
            })
        }
    }

    return (
        <div style={style}>
            <Button
                {...props}
                color="primary"
                variant="contained"
                loading={state.loading}
                onClick={handleClick}
                startIcon={state.connection.accepted ? <Person/> : <PersonAdd/>}
            >
                {state.connection.connection_id ? (state.connection.accepted ? 'Connected' : 'Remove Request') : ('Connect')}
            </Button>

            <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                <MenuItem
                    onClick={() => {setState({...state, anchorEl: null}); deleteUserConnection()}}
                >
                    Remove Connection
                </MenuItem>
            </Menu>
        </div>
    )
}
