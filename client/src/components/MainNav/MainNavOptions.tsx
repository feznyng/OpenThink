import { 
    GroupOutlined,
    Notifications,
    Chat,
    ChatBubbleOutline,
    Group,
    Home,
    HomeOutlined,
    NotificationsOutlined,
} from '@material-ui/icons';
import { Groups, GroupsOutlined } from '@mui/icons-material';

const iconProps = {
  style: {fontSize: 30}
}

const options = [
    {
      link: '/',
      title: 'Home',
      inactiveIcon: <HomeOutlined {...iconProps} />,
      activeIcon: <Home {...iconProps} />,
      location: 'dashboard'
    },
    {
      link: '/spaces',
      title: 'Groups',
      inactiveIcon: <GroupsOutlined {...iconProps} style={{...iconProps.style, fontSize: iconProps.style.fontSize + 5}}/>,
      activeIcon: <Groups {...iconProps} style={{...iconProps.style, fontSize: iconProps.style.fontSize + 5}}/>,
      location: 'spaces'
    },
    {
      link: '/messages',
      title: 'Messages',
      inactiveIcon: <ChatBubbleOutline {...iconProps} />,
      activeIcon: <Chat {...iconProps} />,
      location: 'messages'
    },
    {
      link: '/notifications',
      title: 'Notifications',
      inactiveIcon: <NotificationsOutlined {...iconProps} />,
      activeIcon: <Notifications {...iconProps} />,
      location: 'notifications'
    },
    {
      title: 'Account',
      location: 'account',
    }
]

export default options;