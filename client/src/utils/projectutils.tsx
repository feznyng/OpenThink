import { BubbleChart, CheckBox, Info } from '@material-ui/icons'
import RocketIcon from '../components/Shared/RocketIcon'

export const projectTypes = [
    {
        title: 'General',
        description: 'All basic features.',
        Icon: RocketIcon,
    },
    {
        title: 'Task',
        description: 'View and manage all your tasks.',
        Icon: CheckBox,
    },
    {
        title: 'Graph',
        description: 'Create and analyze relationships.',
        Icon: BubbleChart,
    },
    {
        title: 'Solidarity',
        description: 'Visualize organizational relationships and complete actions together.',
        Icon: BubbleChart,
    },
    {
        title: 'Wiki',
        description: 'Create a knowledge base.',
        Icon: Info,
        comingSoon: true,
    },
    /*
    {
        title: 'Base',
        description: 'Store, organize, and visualize data.',
        Icon: <TableChart fontSize='large'/>
    },
    {
        title: 'Code',
        description: 'Store and develop code using a Git Repository, Agile task management, and a collaborative code editor.',
        Icon: <Code fontSize='large'/>
    },
    {
        title: 'Data',
        description: 'Collaboratively analyze data using code.',
        Icon: <Notes fontSize='large'/>
    },
    */
]
