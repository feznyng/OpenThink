import React from 'react';
import Fuse from 'fuse.js';
import { useSelector } from 'react-redux';
import {Checkbox, MenuItem, TextField, Typography} from '@material-ui/core';
import {Search} from '@material-ui/icons';
import UserCard from '../User/UserCard';
import UserIcon from '../User/UserIconOld';
import { role } from '../../types/message';

interface RoleListItemProps {
    role: role,
    checked: boolean,
    onSelect: (user: role) => void
}

const RoleListItem = (props: RoleListItemProps) => {
    const {
        role,
        checked,
        onSelect
    } = props;

    return (
        <MenuItem 
            style={{display: 'flex', alignItems: 'center'}}
            onClick={(e) => {
                e.preventDefault();
                onSelect(role);
            }}
        >
            <Checkbox checked={checked}/> <Typography>{role.name}</Typography>
        </MenuItem>
    )
}

export default RoleListItem;