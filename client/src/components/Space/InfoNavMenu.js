import React from 'react'
import {useDispatch, useSelector} from 'react-redux';
import NavItem from '../Shared/NavItem/NavItem';
import NavItemText from '../Shared/NavItem/NavItemText';
import {List, ListItem, ListItemText} from '@material-ui/core';
import {setGroupPage, setGroupSettingsPage, setGroupInfoPage} from '../../actions/orgActions';

export default function InfoNavMenu({navigateInfo}) {
    const {
        currInfoPage,
        wikis,
        currSpace,
    } = useSelector(state => state.orgActions);
    const {rules} = currSpace;
    const dispatch = useDispatch();

    return (
        <div>
            <List>
                <ListItem 
                button 
                onClick={() => navigateInfo(0)} 
                selected={currInfoPage === 0}
                >
                    <NavItemText
                        primary={"About"}
                        selected={currInfoPage === 0}
                    />
                </ListItem>
                {
                    rules && 
                    <ListItem 
                        button 
                        onClick={() => navigateInfo(1)} 
                        selected={currInfoPage === 1}
                    >
                        <NavItemText
                            primary={'Rules'}
                            selected={currInfoPage === 1}
                        />
                    </ListItem>
                }
                
                {
                    wikis && wikis.sort((e1, e2) => e1.index - e2.index).map((w, i) => (
                    <ListItem 
                        button 
                        onClick={() => navigateInfo(i + 2)} 
                        selected={currInfoPage === (i + 2)}
                    >
                        <NavItemText
                            primary={w.title}
                            selected={currInfoPage === (i + 2)}
                        />
                    </ListItem>
                    ))
                }
            </List>
        </div>
    )
}
