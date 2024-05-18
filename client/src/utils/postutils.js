import { blue, orange, purple, red, yellow } from '@material-ui/core/colors';
import { CheckCircle, CheckCircleOutline, Create, FileCopy, Group, Person, TableChart } from '@material-ui/icons';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import ErrorIcon from '@material-ui/icons/Error';
import EventIcon from '@material-ui/icons/Event';
import HelpIcon from '@material-ui/icons/Help';
import InfoIcon from '@material-ui/icons/Info';
import LinkIcon from '@material-ui/icons/Link';
import PhotoIcon from '@material-ui/icons/Photo';
import PollIcon from '@material-ui/icons/Poll';
import { ArticleOutlined, RocketLaunch } from '@mui/icons-material';
import GoalIcon from '../components/Shared/GoalIcon';

export const getPostColor = (type, params) => {
    switch(type) {
        case 'Idea':
            return blue[500]
        case 'Information':
            return '#937DCB'
        case 'Task':
            return (!params || params?.completed) ? '#30A860' : undefined
        case 'Topic':
            return '#00DAFF'
        case 'Concern':
            return red[500]
        case 'Event':
            return orange[700]
        case 'Question':
            return '#F9379B';
        case 'Poll':
            return '#20DED9'
        case 'Media':
            return '/assets/media.svg'
        case 'Link':
            return '/assets/link.svg'
        case 'Goal':
            return yellow[700]
        case 'File':
            return purple[500]
        default: 
            return '/assets/goal.svg'
    } 
}

export const getPostIcon = (type, params) => {
    switch(type) {
        case 'Idea':
            return (
                EmojiObjectsIcon
            )
        case 'Information':
            return (
                InfoIcon
            )
        case 'Topic':
            return (
                DeviceHubIcon
            )
        case 'Concern':
            return (
                ErrorIcon
            )
        case 'Event':
            return (
                EventIcon
            )
        case 'Custom':
            return (
                Create
            )
        case 'Database':
            return (
                TableChart
            )
        case 'Question':
            return (
                HelpIcon
            )
        case 'Task':
            return (      
                (!params || params?.completed) ? CheckCircle : CheckCircleOutline
            )
        case 'Poll':
            return (                 
                PollIcon
            )
        case 'Media':
            return (               
                PhotoIcon
            )
        case 'Link':
            return (                
                LinkIcon
            )
        case 'Goal':
            return (                
                GoalIcon
            )
        case 'Group':
            return (                
                Group
            )
        case 'Project':
            return (                
                RocketLaunch
            )
        case 'Person':
            return (                
                Person
            )
        case 'File':
            return (                
                FileCopy
            )
        default: 
            return (            
                ArticleOutlined
            )
    }
}


export const getPostIconSvg = (type) => {
    switch(type) {
        case 'Idea':
            return '/assets/idea.svg'
        case 'Information':
            return '/assets/info.svg'
        case 'Task':
            return '/assets/action.svg'
        case 'Topic':
            return '/assets/topic.svg'
        case 'Concern':
            return '/assets/concern.svg'

        case 'Event':
            return '/assets/event.svg'

        case 'Question':
            return '/assets/question.svg'

        case 'Action':
            return '/assets/action.svg'

        case 'Action Item':
            return '/assets/action.svg'

        case 'Poll':
            return '/assets/poll.svg'

        case 'Media':
            return '/assets/media.svg'

        case 'Link':
            return '/assets/link.svg'
        
        case 'Group':
            return '/assets/group.svg'
        default: 
            return '/assets/goal.svg'
    } 
}



let postTypes = [
    {
        type: 'Idea', 
        tip: 'Get your thoughts out there.', 
        plural: 'Ideas'
    },
    {
        type: 'Topic', 
        tip: 'Organize your brainstorming.', 
        plural: 'Topics'
    },
    {
        type: 'Task', 
        tip: 'Get something done.', 
        plural: 'Tasks'
    },
    {
        type: 'Information', 
        tip: 'Create a new information source.', 
        plural: 'Information'
    },
    {
        type: 'Concern', 
        tip: 'Alert your group about something important.', 
        plural: 'Concerns'
    },
    {
        type: 'Question', 
        tip: 'Ask your group a question.', 
        plural: 'Questions'
    },
    {
        type: 'Event', 
        tip: 'Share an upcoming event with your group.', 
        plural: 'Events'
    },
    {
        type: 'Poll', 
        tip: "Gather your group's thoughts.", 
        plural: 'Polls'
    },
    {
        type: 'Goal', 
        tip: "Share your group's goals.", 
        plural: 'Goals'
    },

    /*
    {type: 'Custom', tip: "Create your own post type with a custom icon and attributes."},
    {type: 'Database', tip: "Organize your posts with a custom view."},
    {type: 'Group', tip: "Reference a group or organization on Openthink or beyond"},
    {type: 'Project', tip: "Reference a project on Openthink or beyond"},
    {type: 'Person', tip: "Reference a person on Openthink or beyond"},
    */ 
]

export const types = postTypes.map(pt => {
    let Icon = getPostIcon(pt.type)
    return {...pt, icon: <Icon style={{color: getPostColor(pt.type)}}/> }
})