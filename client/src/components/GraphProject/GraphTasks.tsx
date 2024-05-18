import { Checkbox, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import React from 'react';

const tasks = [
    'Attend our upcoming meeting',
    'Sign the petition',
    'Tell people about the Green Future Act',
    'Attend our upcoming meeting'
]

export default function GraphTasks() {
    return (
        <div>
            {
                tasks.map((task) => (
                    <ListItem>
                        <ListItemIcon>
                            <Checkbox/>
                        </ListItemIcon>
                        <ListItemText>
                            {task}
                        </ListItemText>
                    </ListItem>
                ))
            }
        </div>
    )
}
