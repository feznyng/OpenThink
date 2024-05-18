import React from 'react'
import {useDispatch, useSelector} from 'react-redux';
import {List, ListItem, ListItemText} from '@material-ui/core';
import {setGroupSettingsPage,} from '../../../actions/orgActions';
import { validateUserType } from '../../../utils/permissions';

const options = [
    {
        title: 'General',
        typeRequired: ['Follower', 'Member', 'Creator', 'Lead']
        
    },
    {
        title: 'Personal',
        typeRequired: ['Follower', 'Member', 'Creator', 'Lead']
    },
    {
        title: 'Users',
        typeRequired: ['Creator', 'Lead']
    },
    /*
    {
        title: 'Roles',
        typeRequired: ['Creator', 'Lead']
    },
    */
]

export default function SettingsMenu({optionStyle}) {
    const {
        currSettingsPage,
        currUser
    } = useSelector(state => state.orgActions);
    const dispatch = useDispatch();
    // currUser.type

    return (
        <div>
            <List>
                {
                    options.filter(({typeRequired}) => validateUserType(currUser.type, typeRequired)).map(({title}, i) => (
                        <ListItem 
                            button 
                            onClick={() => dispatch(setGroupSettingsPage(i))}
                            selected={currSettingsPage === i}
                        >
                            <ListItemText
                                primary={title}
                                style={{color: currSettingsPage === i ? '#2196f3' : ''}}
                                selected={currSettingsPage === i}
                            />
                        </ListItem>
                    ))
                }
            </List>
        </div>
    )
}
