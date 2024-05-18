import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoles, deleteRole } from '../../actions/roleActions';
import {TextField, Typography, MenuItem, Button, Grid, Divider, Tabs, Tab, makeStyles, Switch, Menu, IconButton} from '@material-ui/core';
import Fuse from 'fuse.js';
import { Search, Group, ChevronRight, Person, ChevronLeft, MoreHoriz, Delete } from '@material-ui/icons';
import { CirclePicker } from 'react-color';
import {sections, perms, permFuse} from '../../utils/permissions';
import UserCard from '../User/UserCard';

export const Header = ({children}) =>  <div style={{marginBottom: 10}}><Typography variant="h6">{children}</Typography></div>
export const SubHeader = ({children}) =>  <div style={{marginBottom: 10}}><Typography style={{fontSize: 16, color: '#2196f3'}} variant="h6">{children}</Typography></div>
export const Description = ({children}) => <div style={{marginTop: -5, marginBottom: 20}} ><Typography variant="p">{children}</Typography></div>

export const SettingsSwitch = ({perm, toggleChecked, checked}) => {
    const {
        title,
        desc,
    } = perm
    return (
        <div style={{width: '100%', marginBottom: 10}}>
            <div style={{position: 'relative'}}>
                <Header>
                    {title}
                </Header>
                <div style={{position: 'absolute', right: 10, top: -5}}>
                    <Switch
                        checked={checked} 
                        onChange={toggleChecked}
                    />
                </div>
                
            </div>
            <div>
                <Description>
                    {desc}
                </Description>
            </div>
           <Divider/>
        </div>
    )
}