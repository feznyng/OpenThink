import React from 'react';
import UserIcon from '../User/UserIconOld';
import { user } from '../../types/user';
import graphql from 'babel-plugin-relay/macro';
import { fetchQuery } from '../../utils/graphqlutils';
import Typography from './Typography';
import SelectorInput, { SelectorInputProps } from './SelectorInput';
import { ItemSelectorProps } from '../../types/elements';

interface UserSelectorState {
    users: user[],
    loading?: boolean,
    baseUsers: user[],
    focused: boolean,
    inputValue: string
}

export default function UserSelector({limit, value, onChange, disabled, autoFocus, variant, ...props}: ItemSelectorProps) {
    const [state, setState] = React.useState<UserSelectorState>({
        users: [],
        baseUsers: [],
        inputValue: '',
        focused: false
    })


    React.useEffect(() => {
        fetchQuery(
            graphql`
                query UserSelectorInitialQuery {
                    users(first: 100) {
                        edges {
                            node {
                                userId,
                                profilepic,
                                firstname,
                                lastname
                            }
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }

                    me {
                        firstname
                    }
                }
            `,
            {}
        ).subscribe({
            next: (data: any) => {
                const {edges} = data.users;
                setState({
                    ...state,
                    users: edges.map((e: {node: any}) => e.node),
                    baseUsers: edges.map((e: {node: any}) => e.node),
                })
            },
            error: (error: any) => console.log(error)
        })
    }, [])

    const searchUsers = (name: string) => {
        if (name.length === 0) {
            setState({
                ...state,
                users: state.baseUsers,
            })
        } else {
            setState({
                ...state,
                loading: true
            })
            fetchQuery(
                graphql`
                    query UserSelectorSearchQuery($query: String!) {
                        searchUsers(first: 100, query: $query) {
                            edges {
                                node {
                                    userId,
                                    firstname,
                                    lastname
                                    profilepic
                                }
                            }
                        }
                    }
                `,
                {
                    query: name
                }
            ).subscribe({
                next: (data: any) => {
                    setState({
                        ...state,
                        users: data.searchUsers.edges.map((e: any) => e.node),
                        loading: false,
                    })
                },
                error: (error: any) => console.log(error)
            })
        }
    }

    return (
        <SelectorInput
            {...props}
            id={"user-autocomplete"}
            options={state.users.filter(user => !value.includes(user))}
            limit={limit}
            disabled={disabled}
            getOptionLabel={(option) => `${option.firstname} ${option.lastname}`}
            value={value}
            fullWidth
            autoFocus={autoFocus}
            placeholder={props.placeholder ? props.placeholder : "Search for users..."}
            renderOption={user => (
                <div style={{display: 'flex', alignItems: 'center', marginBottom: 2}}>
                    <UserIcon user={user} size={32}/>
                    <Typography style={{marginLeft: 5}}>{user.firstname} {user.lastname}</Typography>
                </div>
            )}
            getChipProps={(user) => ({
                icon: <UserIcon user={user} size={32}/>
            })}
            onChange={onChange}
            searchOptions={searchUsers}
            textFieldProps={{
                variant,
            }}
        />
    )
}