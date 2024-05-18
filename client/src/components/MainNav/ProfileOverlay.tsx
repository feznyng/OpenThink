import React from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import {
  Menu as MenuIcon,
  Settings,
  ExitToApp,
  CheckBox,
  ChevronRight,
  AspectRatio,
} from '@material-ui/icons';
import { useHistory } from "react-router-dom";
import store, { socket } from '../../Store';
import { signOutCall } from '../../actions/userActions';
import { useDispatch } from "react-redux";
import UserIcon from '../User/UserIcon';
import Event from '@material-ui/icons/Event';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import DisplayOptions from './DisplayOptions';
import { ProfileOverlayQuery } from './__generated__/ProfileOverlayQuery.graphql';

interface ProfileOverlayProps {
    onClose: () => void,
    loaded?: boolean,
    signOut?: () => void
}

export default function ProfileOverlay({onClose, loaded, signOut}: ProfileOverlayProps) {
  const {me} = useLazyLoadQuery<ProfileOverlayQuery>(
    graphql`
      query ProfileOverlayQuery {
        me {
          userId
          firstname
          lastname
          ...UserIconFragment
          ...DisplayOptionsFragment
        }
      }
      
    `,
    {}, 
    {
      fetchPolicy: 'store-and-network'
    }
  )

  const history = useHistory();
  const dispatch = useDispatch();

  const [state, setState] = React.useState({
    page: 'base'
  })

  const [commitSignOut] = useMutation(
    graphql`
      mutation ProfileOverlaySignOutMutation {
        signOut {
          userId
        }
      }
    `
  )

  const profileOptions = [
    /*
    {
      title: 'Give Feedback',
      icon: <ChatBubble/>,
      description: "Help us improve OpenThink",
      onClick: () => history.push('/account')
    },
    */
    {
      title: 'Settings',
      icon: <Settings/>,
      onClick: () => {history.push('/settings'); onClose()}
    },
    /*
    {
      title: 'Help and Support',
      icon: <Help/>,
    },
    */
    {
      title: 'Display',
      icon: <AspectRatio/>,
      onClick: () => {setState({...state, page: 'display'})}
    },
    {
      title: 'Log Out',
      icon: <ExitToApp/>,
      onClick: () => {
        commitSignOut({
          variables: {}
        })
        history.push('/signin');
        onClose();
      }
    }
  ]

  const personalPages = [
    {
      title: 'My Tasks',
      icon: <CheckBox/>,
      onClick: () => {history.push('/my-tasks'); onClose();}
    },
    {
      title: 'My Events',
      icon: <Event/>,
      onClick: () => {history.push('/my-events'); onClose();}
    },
  ]
  
  return (
    <div style={{padding: 10}}>
      {
        state.page === 'base' && 
        <div>
          <ListItem button style={{display: 'relative'}} onClick={() => {history.push(`/profile/${me?.userId}`); onClose();}}>
            <ListItemIcon>
              <UserIcon
                size={50}
                user={me}
              />
            </ListItemIcon>
            <ListItemText
              style={{marginLeft: 10}}
              primary={`${me?.firstname} ${me?.lastname}`}
              secondary="See your profile"
            />
            <div
              style={{position: 'absolute', top: 0, right: 10, height: '100%', display: 'flex', alignItems: 'center'}}
            >
              <ChevronRight/>
            </div>
          </ListItem>
          {
            personalPages.map(({title, icon, onClick}) => (
              <ListItem button onClick={onClick}>
                <ListItemIcon>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  
                  primary={title}
                />
              </ListItem>
            ))
          }
          <Divider style={{marginTop: 5, marginBottom: 5}}/>
          {
            profileOptions.map(({title, icon, onClick}) => (
              <ListItem button onClick={onClick}>
                <ListItemIcon>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  
                  primary={title}
                />
              </ListItem>
            ))
          }
          
        </div>
      }
      {
        me && state.page === 'display' && 
        <DisplayOptions
          user={me}
          exit={() => setState({...state, page: 'base'})}
        />
      }
    </div>
  )
}

  