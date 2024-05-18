import React from 'react';
import Fuse from 'fuse.js';
import {TextField} from '@material-ui/core';
import {Search} from '@material-ui/icons';
import { user } from '../../types/user';
const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    keys: [
        "firstname",
        "lastname",
      ]
  };

const userFuse = new Fuse([], options);

interface MemberSelectorProps {
    users: user[];
    selectedUsers: user[];
    onSelect: (user: user) => void,
}

export default function MemberSelector(props: MemberSelectorProps) {

    const [state, setState] = React.useState({
        users: [] as user[],
    })
    
    const {
        selectedUsers,
        onSelect,
        users
    } = props;

    React.useEffect(() => {
        userFuse.setCollection(users as any);
        setState({
            ...state,
            users
        })
    }, [users])
    
    const searchUsers = (query: string) => {
        
        if (query.length === 0) {
            setState({
                ...state,
                users
            })
        } else {
            setState({
                ...state,
                users: userFuse.search(query)
            })
        }
    }

    return (
        <div>
            <TextField
                variant="outlined"
                placeholder="Search Members"
                size="small"
                fullWidth
                InputProps={{
                    startAdornment: <Search/>
                }}
                onChange={e => searchUsers(e.target.value)}
            />
            <div style={{marginTop: 20}}>
                {
                    state.users.map(u => (
                        <div style={{padding: 5, marginBottom: 5}}>
                            {
                                /*
                                    <UserListItem
                                        user={u}
                                        checked={selectedUsers ? (selectedUsers.indexOf(u) >= 0) : false}
                                        onSelect={u => onSelect(u)}
                                    />
                                */
                            }
                            
                        </div>
                    ))
                }
            </div>  
            
        </div>
    )
}
