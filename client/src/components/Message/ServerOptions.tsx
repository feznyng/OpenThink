import { ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@material-ui/core';
import { ExpandMore, OpenInBrowser } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useSelector } from 'react-redux';
import { useFragment } from 'react-relay';
import { useHistory } from 'react-router';
import { getParentUsers } from '../../actions/orgActions';
import { RootState } from '../../Store';
import { user } from '../../types/user';
import ChannelCreator from './ChannelCreator';

interface ServerOptionsState {
    createPage: number,
    users: user[],
    anchorEl: HTMLElement | null,
    duplicateName?: boolean,
    creatingCategory?: boolean,
    open: boolean
}

interface ServerOptionsProps {
    space: any
}

export default function ServerOptions({space}: ServerOptionsProps) {
    const currSpace = useFragment(    
        graphql`      
            fragment ServerOptions_space on Space {
                id
                spaceId
                name
                type
                project
                profilepic
                numRooms
            }
        `,
        space
    );
    const history = useHistory();
    const darkMode = useSelector((state: RootState) => state.uiActions.darkMode);

    const original_state = {
        createPage: 0,
        users: [],
        anchorEl: null,
        open: false,
    }

    const [state, setState] = React.useState<ServerOptionsState>({
        ...original_state,
    })
        
    React.useEffect(() => {
        getParentUsers(currSpace.space_id).then(users => {
            setState({
                ...state,
                users
            })
        })
    }, [])

    return (
        <div style={{height: '100%'}}>
            <ListItem 
                button 
                style={{textTransform: 'none', textAlign: 'left', width: '100%', borderRadius: 0, height: '100%', position: 'relative'}}
                onClick={e => setState({...state, anchorEl: e.currentTarget})}
            >
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Typography style={{fontSize: 18, marginLeft: 5}} variant="h6">
                        {currSpace.name &&  (currSpace.name).substring(0, 20) + (currSpace.name.length > 20 ? '...' : '')}
                    </Typography>
                </div>
                <ExpandMore style={{position: 'absolute', right: 12, }}/>
            </ListItem>
            <Menu
                open={Boolean(state.anchorEl)} 
                anchorEl={state.anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                getContentAnchorEl={null}
                onClose={() => setState({...state, anchorEl: null})}
            >
                {
                    <OptionItem
                        title={`Visit ${currSpace.project ? 'Project' : 'Space'}`}
                        icon={<OpenInBrowser/>}
                        onClick={() => history.push(`/space/${currSpace.spaceId}`)}
                    />
                }
                {
                    <OptionItem
                        title="Create Channel"
                        icon={<Typography style={{fontSize: 24, marginLeft: 5}} variant="h6">#</Typography>}
                        onClick={() => setState({...state, open: true, anchorEl: null})}
                    />
                }
            </Menu>
            <ChannelCreator
                spaceId={currSpace.spaceId}
                open={state.open}
                parentID={currSpace.id}
                index={currSpace.numRooms}
                onClose={() => setState({...state, open: false})}
            />
        </div>
    )
}

interface OptionItemProps {
    title: string, 
    icon: React.ReactElement, 
    onClick: () => void, 
    warn?: boolean
}

const OptionItem = ({title, icon, onClick, warn}: OptionItemProps) => {
    const [state, setState] = React.useState({
        hover: false
    })
    return (
        <MenuItem 
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
            onClick={onClick} 
            style={{position: 'relative', height: 30, marginBottom: 5, backgroundColor: state.hover ? (warn ? 'red' : '#2196f3') : ''}}
        > 
            <ListItemIcon style={{color: state.hover ? 'white' : (warn ? 'red' : '')}}>
                {icon}
            </ListItemIcon>
            <ListItemText style={{color: state.hover ? 'white' : (warn ? 'red' : '')}}>
                {title}
            </ListItemText>
        </MenuItem>
    )
}


