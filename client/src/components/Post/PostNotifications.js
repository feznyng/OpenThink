import React, {useEffect} from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Notifications from '@material-ui/icons/Notifications'
import IconButton from '@material-ui/core/IconButton'; 
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import {unfollowPost, followPost} from '../../actions/postActions';
import {useDispatch} from 'react-redux';
import store from '../../Store';
import { Close } from '@material-ui/icons';
import { Snackbar } from '@material-ui/core';
const noteSettings = [
    'Edits',
    'Relations',
    'Discussion'
  ]

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
PaperProps: {
    style: {
    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    width: 250
    }
},
getContentAnchorEl: null
};

export default function PostNotifications(props) {
    const {post, parentType, preview, onChange, size} = props;
    const [open, setOpen] = React.useState(false);
    const [notificationSettings, setNotificationSettings] = React.useState(false);
    const dispatch = useDispatch();
    const thisPost = {...post, body: undefined};
    useEffect(() => {
      const user = store.getState().userActions.userInfo && thisPost.users ? thisPost.users.find(e => e.user_id === store.getState().userActions.userInfo.user_id) : null;
      if (user) {
        if (user.relations) {
          setNotificationSettings(true);
        } else {
          setNotificationSettings(false);
        }
      }
      
    }, [])

    const toggleNotifications = () => {
      if (notificationSettings) {
        dispatch(unfollowPost(parentType, post.original_post_id));
      } else {
        console.log('here')
        dispatch(followPost(parentType, post.original_post_id, {
          edits: true,
          relations: true,
          comments: true
        }));
      }
      setNotificationSettings(!notificationSettings);
      setOpen(true);
    }

    return (
        <span>
          <IconButton aria-label="share" onClick={toggleNotifications}>
            {
              notificationSettings > 0 ?
              <NotificationsActiveIcon style={{fontSize: size}}/>
              :
              <Notifications style={{fontSize: size}}/>

            }
          </IconButton>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={open}
            autoHideDuration={6000}
            onClose={() => setOpen(false)}
            message="You'll receive notifications for this post"
            action={
              <React.Fragment>
                <IconButton size="small" aria-label="close" color="inherit" onClick={(e) => {e.preventDefault(); setOpen(false)}}>
                  <Close fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
          />
        </span>
    )
}
