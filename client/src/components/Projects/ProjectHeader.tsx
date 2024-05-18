import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@material-ui/core'
import { ChevronLeft, MoreVert, Settings } from '@material-ui/icons'
import graphql from 'babel-plugin-relay/macro';
import { CSSProperties, Fragment, ReactElement, useState } from 'react';
import { useFragment } from 'react-relay'
import { useHistory } from 'react-router'
import { useAppSelector } from '../../Store';
import { Anchor } from '../Post/PostContentEditor';
import Typography from '../Shared/Typography'
import SpaceIcon from '../Space/SpaceIcon'

interface ProjectHeaderProps {
    space: any,
    style?: CSSProperties,
    actions?: {icon: ReactElement, name: string}[],
    onAction?: (name: string) => void
}

interface ProjectHeaderState {
    anchorEl: Anchor
}

export default function ProjectHeader({space, actions, onAction, style}: ProjectHeaderProps) {
    const {parentSpaceId, spaceId, name, ...data} = useFragment(
        graphql`
            fragment ProjectHeaderFragment on Space {
                parentSpaceId
                spaceId
                name
                ...SpaceIconFragment
            }
        `,
        space
    )

    const [state, setState] = useState<ProjectHeaderState>({
        anchorEl: null
    })

    const history = useHistory()
    const lastPage = useAppSelector(state => state.router.lastPage)

    const goBack = () => {
        if (parentSpaceId) {
            history.push(`/space/${parentSpaceId}/projects`)
        } else if (lastPage.includes('/spaces')) {
            history.goBack()
        } else {
            history.push('/')
        }
    }
    
    return (
        <div style={{...style, display: 'flex', alignItems: 'center'}}>
            <Tooltip title="Go Back">
                <IconButton onClick={goBack} size="small" style={{marginRight: 5}}>
                    <ChevronLeft fontSize="large"/>
                </IconButton>
            </Tooltip>
            <SpaceIcon
                space={data}
            />
            <Typography style={{marginLeft: 15}} variant='h6'>
                {name}
            </Typography>
            <Fragment>
                <IconButton 
                    size='small'
                    onClick={(e) => setState({...state, anchorEl: e.currentTarget})}
                >
                    <MoreVert/>
                </IconButton>
                <Menu
                    anchorEl={state.anchorEl}
                    open={!!state.anchorEl}
                    onClose={() => setState({...state, anchorEl: null})}
                >
                    {
                        [{name: 'Settings', icon: <Settings/>}, ...(actions ? actions : [])].map(({icon, name}) => (
                            <MenuItem
                                onClick={() => {
                                    if (name === 'Settings') history.push(`/space/${spaceId}/settings`)
                                    onAction && onAction(name)
                                    setState({
                                        ...state,
                                        anchorEl: null
                                    })
                                }}
                            >
                                <ListItemIcon>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={name}
                                />
                            </MenuItem>
                        ))
                    }
                </Menu>
            </Fragment>
        </div>
    )
}
