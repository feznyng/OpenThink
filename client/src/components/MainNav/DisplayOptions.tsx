import React from 'react';
import {
  Typography,
  IconButton, 
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
} from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import {
  ArrowBack,
  ViewCompact,
  Brightness2,
} from '@material-ui/icons';
import { useFragment } from 'react-relay'
import commitUpdateUserPrefs from '../../mutations/UpdateUserPrefs';

interface DisplayOptionsProps {
    exit: () => void,
    user: any
}

export default function DisplayOptions({user, exit}: DisplayOptionsProps) {
  const {darkMode, productivityView} = useFragment(
    graphql`
      fragment DisplayOptionsFragment on User {
        darkMode
        productivityView
      }
    `
    ,
    user
  )

  const toggleDarkMode = () => {
    console.log('toggling dark mode')
    commitUpdateUserPrefs(
      {darkMode: !!!darkMode},
    )
  }

  const toggleProductivityView = () => {
    console.log('toggling productivity mode')
    commitUpdateUserPrefs(
      {productivityView: !!!productivityView},
    )
  }

  const options = [
    {
      icon: <Brightness2/>,
      title: 'Dark Mode',
      description: 'Adjust the appearance of OpenThink to reduce glare and give your eyes a break.',
      value: !!darkMode,
      onClick: toggleDarkMode
    },
    /*
    {
      icon: <ViewCompact/>,
      title: 'Productivity Mode',
      description: "Optimize the layout of OpenThink for productivity.",
      value: !!productivityView,
      onClick: toggleProductivityView
    },
    */
  ]

  return (
      <div>
          <Typography variant="h6">
            <IconButton onClick={exit}><ArrowBack/></IconButton> Display
          </Typography>
          <div style={{marginLeft: 5, marginRight: 5}}>
            {
              options.map(({icon, title, description, value, onClick}) => (
                <div>
                  <ListItem style={{padding: 0}}>
                    <ListItemIcon>
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={title}
                      secondary={description}
                      secondaryTypographyProps={{variant: 'subtitle2'}}
                    />
                  </ListItem>
                <ListItem style={{padding: 0}} button onClick={onClick}>
                  <ListItemIcon>
                    <Radio
                      checked={value}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="On"
                  />
                </ListItem>
                <ListItem style={{padding: 0}} button onClick={onClick}>
                  <ListItemIcon>
                    <Radio
                      checked={!value}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Off"
                  />
                </ListItem>
                </div>
              ))
            }
          
          </div>
          
        </div>
    )
}
