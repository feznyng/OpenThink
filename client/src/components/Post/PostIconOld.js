import React from 'react'
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import InfoIcon from '@material-ui/icons/Info';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import ErrorIcon from '@material-ui/icons/Error';
import EventIcon from '@material-ui/icons/Event';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PollIcon from '@material-ui/icons/Poll'
import HelpIcon from '@material-ui/icons/Help'
import PropTypes from 'prop-types';
import PhotoIcon from '@material-ui/icons/Photo';
import LinkIcon from '@material-ui/icons/Link';
import Avatar from '@material-ui/core/Avatar'
import Badge from '@material-ui/core/Badge'
import UserIcon from '../User/UserIconOld';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import GoalIcon from '../Shared/GoalIcon';
import { Create, TableChart } from '@material-ui/icons';
import { getPostColor } from '../../utils/postutils';
import { Tooltip } from '@material-ui/core';
import { Group, Person } from '@material-ui/icons';
import RocketIcon from '../Shared/RocketIcon';

/**
 * Icon used by posts dictated by post type. 
 */


export default function PostIcon(props) {
    const {post, wiki, simple, size, color} = props;
    if (post.wiki && wiki) {
      return (<ImportContactsIcon fontSize="large"></ImportContactsIcon>);
    }

    const iconColor = color ? color : getPostColor(post.type)

    if (!simple) {
      switch(post.type) {
        case 'Idea':
          return (
            <EmojiObjectsIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Information':
          return (
            <InfoIcon style={{fontSize: size, color: iconColor}}/>  
          )
        case 'Topic':
          return (
            <DeviceHubIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Concern':
          return (
            <ErrorIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Event':
          return (
            <EventIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Custom':
          return (
            <Create style={{fontSize: size, color: color}}/>
          )
        case 'Database':
          return (
            <TableChart style={{fontSize: size, color: color}}/>
          )
        case 'Question':
          return (
            <HelpIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Action':
          return ( 
            <CheckCircleIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Action Item':
          return (           
            <CheckCircleIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Task':
          return (           
            <CheckCircleIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Poll':
          return (                 
            <PollIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Media':
          return (               
            <PhotoIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Link':
          return (                
            <LinkIcon style={{fontSize: size, color: iconColor}}/>
          )
        case 'Goal':
          return (                
            <GoalIcon size={size} style={{fontSize: size, color: iconColor}}/>
          )
        case 'Group':
          return (                
            <Group style={{fontSize: size, color: color}}/>
          )
        case 'Project':
          return (                
            <RocketIcon style={{fontSize: size, color: color}}/>
          )
        case 'Person':
          return (                
            <Person style={{fontSize: size, color: color}}/>
          )
        default: 
          return (            
            <EmojiObjectsIcon style={{fontSize: size, color: iconColor}}/>
          )
      }
    }
}
