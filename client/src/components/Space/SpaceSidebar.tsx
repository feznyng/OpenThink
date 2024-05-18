import { Card, List, ListItem, ListItemIcon, ListItemText, Divider, Paper} from '@material-ui/core'
import { Add, Explore, Group, LocationOn } from '@material-ui/icons';
import { Attractions, Rocket } from '@mui/icons-material';
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router';
import { RootState, useAppSelector } from '../../Store';
import BackgroundIcon from '../Shared/BackgroundIcon';
import Button from '../Shared/Button';
import SpaceFilters from '../SpaceExplorer/SpaceFilters';


export const spaceNavItems = [
    {
        title: 'Discover Groups',
        Icon: Explore,
        link: ''
    },
    {
        title: 'Discover projects',
        Icon: Attractions,
        link: 'projects'
    },
    {
        title: 'My Groups',
        Icon: Group,
        link: 'my-groups'
    },
    {
        title: 'My Projects',
        Icon: Rocket,
        link: 'my-projects'
    },
    {
        title: 'Map',
        Icon: LocationOn,
        link: 'map'
    }
];


export default function SpaceSidebar({createGroup}: {createGroup: () => void}) {
    const jwt = useAppSelector(state => state.userActions.jwt);
    const { spacePage } = useParams<{spacePage: string | undefined}>();
    const history = useHistory();

    return (
        <div style={{width: '100%'}}>
            <Paper style={{width: '100%', height: '100vh', borderRadius: 0, boxShadow: 'none'}}>               
                <List style={{ marginBottom: 10}}>
                    {
                        spaceNavItems.map(({title, Icon, link}) => (
                            <ListItem
                                button
                                onClick={() => {
                                    if (link === 'my-groups' && !jwt) {
                                        history.push(`/signup`)
                                    } else {
                                        history.push(`/spaces/${link}`)
                                    }
                                }}
                                selected={spacePage === link || (!spacePage && link === '')}
                            >
                                <ListItemIcon>
                                    <BackgroundIcon
                                        Icon={Icon}
                                        selected={spacePage === link || (!spacePage && link === '')}
                                    />
                                </ListItemIcon>
                                
                                <ListItemText
                                    primaryTypographyProps={{style: {fontWeight: 500}}}
                                    primary={title}
                                />
                            </ListItem>
                        ))
                    }
                    
                </List>
                <div style={{padding: 15, paddingTop: 0}}>
                    <Button color="primary" variant="contained" startIcon={<Add/>} style={{textTransform: 'none'}} fullWidth disableElevation onClick={jwt ? createGroup : () => history.push('/signup')}>
                        Create Group
                    </Button>
                    <Divider style={{marginTop: 20}}/>
                    <div>
                        
                    </div>
                </div>
            </Paper>
        </div>
    )
}

