import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import { ReactElement } from 'react';

interface MenuListItemProps {
    title: string;
    onClick: () => void;
    icon: ReactElement;
    selected?: boolean;
    style?: any
}

const MenuListItem = ({title, onClick, icon, selected, style}: MenuListItemProps) => (
    <MenuItem
        onClick={onClick}
        style={{height: 30, marginTop: 5, ...style}}
        selected={selected}
    >
        <ListItemIcon>
            {icon}
        </ListItemIcon>
        <ListItemText
            style={{marginLeft: -15}}
            primary={title}
        />
    </MenuItem>
);

export default MenuListItem;