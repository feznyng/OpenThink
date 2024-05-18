import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useDispatch } from "react-redux";
import { getUserNotifications } from '../actions/userActions';
import { deleteUserNotifications, readUserNotifications, deleteUserNotification } from '../actions/notificationActions';
import store from '../Store';
import NotificationCard from '../components/NotificationCard/NotificationCard';
import { getImage } from '../actions/S3Actions'
import Divider from '@material-ui/core/Divider';
import Skeleton from '@material-ui/lab/Skeleton';
import { Typography, Button, withWidth } from '@material-ui/core';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3} >
          {children}
                  </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 224,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function Notifications(props) {
  const [value, setValue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState([]);
  const [state, setState] = React.useState({
    emptyMessage: "You're all caught up!"
  });
  let index = 0;
  const dispatch = useDispatch();
  const currUser = store.getState().userActions.userInfo;

  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0: 
        setState({...state, emptyMessage: "You're all caught up"})
        break;
      case 1: 
        setState({...state, emptyMessage: "No updates from your followed posts"})
        break;
      case 2: 
        setState({...state, emptyMessage: "Nothing to report from your groups"})
        break;
      case 3: 
        setState({...state, emptyMessage: "No more post notifications"})
        break;
      case 4: 
        setState({...state, emptyMessage: "No pending invites"})
        break;
      case 5: 
        setState({...state, emptyMessage: "No pending requests"})
        break;
      default:
        break;
    }
    setValue(newValue);
  };

  useEffect(() => {
    dispatch(getUserNotifications()).then((e) => {
      setLoading(false);
      convertNotes(e);
    })
    window.scrollTo(0, 0);
       
    }, []);


  const convertNotes = (newVal) => {
    if (!newVal) {
        return;
    }
    setLoading(true);
    const noteArray = [];
    try {
     
      newVal.forEach(notification => {
        let note;
        if (notification.original_post_deleted || notification.space_post_deleted || notification.project_post_deleted) {
          deleteUserNotification(notification.user_notification_id);
        }
        switch (notification.notification_type) {
          case 'projectPost':
              note = {
                type: ['post', 'project'], 
                description: `${notification.firstname} created a Post: ${notification.title} in project ${notification.project_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials:( notification.firstname + notification.lastname).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}/post/${notification.project_post_id}`
              };
              break;
          case 'spacePost':
            note = {
              type: ['post', 'space', ], 
              description: `${notification.firstname} created a Post: ${notification.title} in group ${notification.space_name}.`, 
              avatarURL: getImage(notification.profilepic),
              initials:( notification.firstname + notification.lastname).split(" ").map((n)=>n[0]).join(""),
              url: `/space/${notification.space_id}/post/${notification.space_post_id}`
            };
            break;
          case 'postEdit':
              note = {
                type: ['post', notification.space_post_id ? 'space' : 'project'], 
                description: `${notification.firstname} edited a Post: ${notification.title}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/${notification.space_post_id ? 'space' : 'project'}/${notification.space_id ? notification.space_id : notification.project_id}/post/${notification.space_post_id ? notification.space_post_id : notification.project_post_id}`
              };
              break;
          case 'postRelation':
              note = {
                type: ['post', notification.space_post_id ? 'space' : 'project'], 
                description: `${notification.firstname} added a new relation to post ${notification.title} - ${notification.project_post2_title ? notification.project_post2_title : notification.space_post2_title}.`, 
                avatarURL: getImage(notification.profilepic),
                initials:( notification.firstname + notification.lastname).split(" ").map((n)=>n[0]).join(""),
                url: `/${notification.space_post_id ? 'space' : 'project'}/${notification.space_id ? notification.space_id : notification.project_id}/post/${notification.space_post_id ? notification.space_post_id : notification.project_post_id}`
              };
              break;
          case 'postComment':
              note = {
                type: ['post', notification.space_post_id ? 'space' : 'project'], 
                description: `${notification.firstname} commented on Post: ${notification.title}`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/${notification.space_post_id ? 'space' : 'project'}/${notification.space_id ? notification.space_id : notification.project_id}/post/${notification.space_post_id ? notification.space_post_id : notification.project_post_id}`
              };
              break;
            case 'projectRequest':
              note = {
                type: ['project', 'request'], 
                description: notification.project_user_accepted ? `${notification.firstname} ${notification.lastname} has joined ${notification.project_name} as a ${notification.project_user_type}.` :
                `${notification.firstname} ${notification.lastname} is requesting to join as a ${notification.project_user_type} for ${notification.project_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                accepted: notification.project_user_accepted,
                project_user_id: notification.project_user_id,
                project_id: notification.user_project_id,
                user_id: notification.project_user_original_id,
                url: `/profile/${notification.notification_created_by}`
              };
              break; 
            case 'spaceRequest':
              note = {
                type: ['space', 'request'], 
                description: `${notification.firstname} ${notification.lastname} is requesting to join as a ${notification.space_user_type} for ${notification.space_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                accepted: notification.space_user_accepted,
                space_user_id: notification.space_user_id,
                space_id: notification.user_space_id,
                user_id: notification.space_user_original_id,
                url: `/profile/${notification.notification_created_by}`
              };
              break; 
            case 'spaceRequestAccept':
              note = {
                type: ['space', 'request'], 
                description: `${notification.space_name} has accepted your request to join.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.space_id}`
              };
              break; 
            case 'spaceRequestReject':
              note = {
                type: ['space', 'request'], 
                description: `${notification.space_name} has declined your request to join.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.space_id}`
              };
              break;
            case 'projectRequestAccept':
              note = {
                type: ['project', 'request'], 
                description: `${notification.project_name} has accepted your request to join.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break; 
            case 'projectRequestReject':
              note = {
                type: ['project', 'request'], 
                description: `${notification.project_name} has declined your request to join.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break; 
            case 'spaceInvite':
              note = {
                type: ['space', 'invite'], 
                description: `${notification.space_name} has invited you to join as a ${notification.space_user_type}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.space_id}`,
                accepted: notification.space_user_accepted,
                space_user_id: notification.space_user_id,
                space_id: notification.user_space_id,
                user_id: notification.space_user_original_id
              };
              break; 
            case 'projectInvite':
              note = {
                type: ['project', 'invite'], 
                description: `${notification.project_name} has invited you to join as a ${notification.project_user_type}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                accepted: notification.project_user_accepted,
                project_user_id: notification.project_user_id,
                project_id: notification.user_project_id,
                user_id: notification.project_user_original_id,
                url: `/project/${notification.project_id}`
              };
              break; 
            case 'spaceInviteAccept':
              note = {
                type: ['space', 'invite'], 
                description: `${notification.firstname} ${notification.lastname} has accepted your request to join ${notification.space_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.space_id}`
              };
              break; 
            case 'spaceInviteReject':
              note = {
                type: ['space', 'invite'], 
                description: `${notification.firstname} ${notification.lastname} has declined your invite to join ${notification.space_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.space_id}`
              };
              break;
            case 'projectInviteAccept':
              note = {
                type: ['project', 'invite'], 
                description: `${notification.firstname} ${notification.lastname} has accepted your request to join ${notification.project_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break; 
            case 'projectInviteReject':
              note = {
                type: ['project', 'invite'], 
                description: `${notification.firstname} ${notification.lastname} has declined your invite to join ${notification.project_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break;
            case 'eventInvite':
              note = {
                type: ['post', 'invite'], 
                description: `${notification.firstname} ${notification.lastname} has invited you to an event:  ${notification.title}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break;
            case 'newSubspace':
              note = {
                type: ['space'], 
                description: `${notification.firstname} ${notification.lastname} created a new subgroup ${notification.subspace_name} in group ${notification.space_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break;
            case 'newProject':
              note = {
                type: ['space', 'project'], 
                description: `${notification.firstname} ${notification.lastname} created a new project ${notification.project_name} in group ${notification.space_name}.`, 
                avatarURL: getImage(notification.profilepic),
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                url: `/project/${notification.project_id}`
              };
              break;
            case 'connection request':
              note = {
                type: ['connection'], 
                description: notification.description, 
                avatarURL: getImage(notification.profilepic),
                connection_id: notification.connection_id,
                url: `/profile/${notification.user_id}`,
                initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                connection_id: notification.connection_id
              };
              break;
             case 'connection acceptance':
                note = {
                  type: ['connection'], 
                  description: notification.description, 
                  avatarURL: getImage(notification.profilepic),
                  connection_id: notification.connection_id,
                  url: `/profile/${notification.user_id}`,
                  initials: (`${notification.firstname} ${notification.lastname}`).split(" ").map((n)=>n[0]).join(""),
                  connection_id: notification.connection_id
                };
                break;
          default:
            break;
        }
        note.id = notification.user_notification_id;
        note.read = notification.read;
        note.notification_type = notification.notification_type
        note.created_by = notification.notification_created_by
        note.created_at = notification.notification_created_at
        note.user_id = notification.notification_user_id
        noteArray.push(note);
      });
      setLoading(false);
      setNotifications(noteArray);
    } catch(e) {
      setLoading(false);
      return;
    }
  }
  return (
    <div style={{paddingTop: '3vw'}}>
                <Container >
                    
        <Row>
            <Col md={3}>
              {
                !(props.width === 'xs' || props.width === 'sm') &&
                <div>
                  <p style={{textAlign:'center'}}>Filters</p>
                  <Divider style={{marginBottom:'10px'}}/>
                </div>
                
              }
              
              <Tabs
                orientation={(props.width === 'xs' || props.width === 'sm') ? 'horizontal' : 'vertical'}
                value={value}
                onChange={handleChange}
                variant="scrollable" 
                scrollButtons="auto"
               >
                <Tab label="All"  />
                <Tab label="Posts" />
                <Tab label="Groups" />
                <Tab label="Projects" style={{display: 'none'}}/>               
                <Tab label="Invites" />
                <Tab label="Requests" />
                <Tab label="Connections" />
              </Tabs>
            </Col>
            <Col xs={9} >
            {loading && <div>
                  <Skeleton style={{height:'120px'}}/>
                <Skeleton style={{height:'120px'}}/>
                <Skeleton style={{height:'120px'}}/>

                  </div>
                  }
                  {!loading && notifications.length === 0 &&
                    <Typography style={{marginTop: '20px', textAlign: 'center'}} variant="h5">{state.emptyMessage}</Typography>
                  }
            {!loading && notifications.length > 0 && 
                <div style={{paddingTop: '20px', marginTop: -20}}>
                  <div style={{float: 'right', marginRight: '13px'}}>
                  <Button onClick={() => dispatch(readUserNotifications())} color="primary">
                    Read All
                  </Button>
                  <Button onClick={() => dispatch(deleteUserNotifications())} style={{color: 'red'}}>
                    Delete All
                  </Button>
                  </div>
                  <div style={{marginTop: '20px'}}>
                  <TabPanel value={value} index={0}>
                  
                  {notifications
                  .map((n, i) => {
                    return (
                      <div style={{marginBottom:'10px'}} key={index++}>
                        <NotificationCard notification={n} currUser={currUser}/>
                        </div>
                    )
                  })
                  }
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    {notifications
                    .filter((n, i) => n.type.includes('post'))
                    .map((n, i) => {
                      return (
                        <div style={{marginBottom:'10px'}} key={index++}>
                          <NotificationCard notification={n} />
                          </div>
                      )
                    })
                    }
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    {notifications
                    .filter((n, i) => n.type.includes('space'))
                    .map((n, i) => {
                      return (
                        <div style={{marginBottom:'10px'}} key={index++}>
                          <NotificationCard notification={n} />
                          </div>
                      )
                    })
                    }
                  </TabPanel>
                  <TabPanel value={value} index={3}>
                    {notifications
                    .filter((n, i) => n.type.includes('project'))
                    .map((n, i) => {
                      return (
                        <div style={{marginBottom:'10px'}} key={index++}>
                          <NotificationCard notification={n} />
                          </div>
                      )
                    })
                    }
                  </TabPanel>
                  <TabPanel value={value} index={4}>
                    {notifications
                    .filter((n, i) => n.type.includes('invite'))
                    .map((n, i) => {
                      return (
                        <div style={{marginBottom:'10px'}} key={index++}>
                          <NotificationCard notification={n} />
                          </div>
                      )
                    })
                    }
                  </TabPanel>
                  <TabPanel value={value} index={5}>
                    {notifications
                    .filter((n, i) => n.type.includes('request'))
                    .map((n, i) => {
                      return (
                        <div style={{marginBottom:'10px'}} key={index++}>
                          <NotificationCard notification={n} />
                          </div>
                      )
                    })
                    }
                  </TabPanel>
                  <TabPanel value={value} index={5}>
                    {notifications
                    .filter((n, i) => n.type.includes('connection'))
                    .map((n, i) => {
                      return (
                        <div style={{marginBottom:'10px'}} key={index++}>
                          <NotificationCard notification={n} />
                          </div>
                      )
                    })
                    }
                  </TabPanel>
                  </div>
               
                </div>
            } 
      
            </Col>
        </Row>
    </Container>
      
      
    </div>
  );
}

export default withWidth()(Notifications)