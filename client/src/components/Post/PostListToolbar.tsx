import { Checkbox, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core'
import { KeyboardArrowDown, ArrowUpward, Comment, FilterList, NewReleases, Share, Sort, BubbleChartOutlined, Forum, Whatshot, ReportProblem, Star, CalendarToday, LocationCity, LocationOn, MoreVert } from '@material-ui/icons'
import { DensityMedium, DensityMediumOutlined, MarkChatUnread, NearbyError, TableRows, TableRowsOutlined, Article, Upcoming } from '@mui/icons-material'
import React, { ReactElement } from 'react'
import Button from '../Shared/Button'
import {types} from '../../utils/postutils'
import { primaryColor } from '../../theme'
import { blue, orange, green, red, yellow } from '@material-ui/core/colors';

/**
 * 
 * - Filter type: Idea, Task, etc
 * - Sort by: New, Top, # comments, # subposts
 */

const sorts: {title: Sort, desc?: string, defaultVal?: boolean, icon: ReactElement}[] = [
    {
        title: 'Best',
        icon: <ArrowUpward style={{color: primaryColor}}/>,
        desc: 'Most upvoted'
    },
    /*
    {
        title: 'Nearby',
        icon: <LocationOn style={{color: blue[700]}}/>,
        desc: 'Closest to you'
    },
    */
    {
        title: 'Trending',
        icon: <Whatshot style={{color: '#FF7700'}}/>,
        desc: 'Most upvoted recently'
    },
    {
        title: 'New',
        icon: <Upcoming style={{color: green[500]}}/>,
        desc: 'Recently created posts'
    },
    {
        title: 'Active',
        icon: <MarkChatUnread style={{color: orange[500]}}/>,
        desc: 'Recent edits, comments, subposts'
    },
    {
        title: 'Controversial',
        icon: <NearbyError style={{color: red[600]}}/>,
        desc: 'Equal upvotes to downvotes'
    },
]

const views: {title: View, desc?: string, defaultVal?: boolean, icon: ReactElement}[] = [
    {
        title: 'Card',
        icon: <TableRowsOutlined/>,
        desc: 'Default card layout',
        defaultVal: true, 
    },
    /*
    {
        title: 'List',
        icon: <DensityMediumOutlined/>,
        desc: 'Compact list layout'
    },
    {
        title: 'Calendar',
        icon: <CalendarToday/>,
        desc: 'Full screen calendar'
    },
    */
    {
        title: 'Graph',
        icon: <BubbleChartOutlined/>,
        desc: 'Full screen graph',
    }
]

const filters = [
    {
        type: 'Post',
        plural: 'Posts',
        icon: <Article/>,
        tip: 'All posts in the group',
    },
    ...types
]

export type Sort = 'Nearby' | 'New' | 'Top' | 'Best' | 'Active' | 'Trending' | 'Controversial'
export type View = 'Card' | 'List' | 'Graph' | 'Calendar'

export interface PostListToolbarProps {
    changeFilter: (filter: string | null) => void,
    changeSort: (type: Sort) => void,
    changeView: (view: View) => void,
    disabledViews?: View[]
    disableViews?: boolean
    sort: string,
    view: string,
    filter: string | null,
    style?: React.CSSProperties,
    hideViews?: boolean,
}

interface PostListToolbarState {
    sortAnchorEl: null | Element,
    filterAnchorEl: null | Element,
    viewAnchorEl: null | Element
    
}

export default function PostListToolbar({changeFilter, changeSort, changeView, disableViews, hideViews, disabledViews, filter, view, sort, style}: PostListToolbarProps) {
    const [state, setState] = React.useState<PostListToolbarState>({
        sortAnchorEl: null,
        filterAnchorEl: null,
        viewAnchorEl: null
    })

    return (
        <div style={{height: 35, ...style}}>
            <span style={{display: 'flex', alignItems: 'center', float: 'left'}}>
                
                <Button
                    startIcon={sorts.find(st => st.title === sort)?.icon}
                    onClick={(e) => setState({...state, sortAnchorEl: e.currentTarget})}
                    size="small"
                >
                    {sort}
                </Button>
                <Menu
                    open={!!state.sortAnchorEl}
                    anchorEl={state.sortAnchorEl}
                    onClose={() => setState({...state, sortAnchorEl: null})}
                >
                    {
                        sorts.map(({title, icon, desc}) => (
                            <MenuItem
                                onClick={() => {changeSort(title); setState({...state, sortAnchorEl: null})}}
                                selected={title === sort}
                            >
                                <ListItemIcon>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={title}
                                    secondary={desc}
                                />
                                
                            </MenuItem>
                        ))
                    }
                </Menu>
                <Button
                    startIcon={!!filter ? filters.find(pt => pt.type === filter)?.icon : <Article/>}
                    style={{marginRight: 5}}
                    onClick={(e) => setState({...state, filterAnchorEl: e.currentTarget})}
                    size="small"
                >
                    {filter ? filters.find(f => f.type === filter)!.plural : 'Posts'}
                </Button>
                <Menu
                    open={!!state.filterAnchorEl}
                    anchorEl={state.filterAnchorEl}
                    onClose={() => setState({...state, filterAnchorEl: null})}
                    
                >
                    {
                        filters.map(({type, icon}) => (
                            <MenuItem
                                selected={(!filter && type === 'Post') || (type === filter)}
                                onClick={() => {changeFilter(type === 'Post' ? null : type); setState({...state, filterAnchorEl: null})}}
                            >
                                <ListItemIcon>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={type}
                                />
                            </MenuItem>
                        ))
                    }
                </Menu>
            </span>
            {
                !hideViews &&
                <span style={{float: 'right', display: 'flex', alignItems: 'center'}}>
                    {
                        !disableViews &&
                        <Button
                            startIcon={views.find(v => v.title === view)?.icon}
                            onClick={e => setState({...state, viewAnchorEl: e.currentTarget})}
                            size="small"
                        >
                            {view}
                        </Button>
                        
                    }
                    
                    <Menu
                        open={!!state.viewAnchorEl}
                        anchorEl={state.viewAnchorEl}
                        onClose={() => setState({...state, viewAnchorEl: null})}
                    >
                        {
                            views.filter(v => !disabledViews?.includes(v.title)).map(({title, desc, icon}) => (
                                <MenuItem
                                    onClick={() => {changeView(title); setState({...state, viewAnchorEl: null})}}
                                >
                                    <ListItemIcon>
                                        {icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={title}
                                        secondary={desc}
                                    />
                                    
                                </MenuItem>
                            ))
                        }
                    </Menu>
                </span>
            }
        </div>
    )
}
