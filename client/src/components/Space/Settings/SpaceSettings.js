import React from 'react';
import { useDispatch } from 'react-redux';
import { Card, Typography, CircularProgress, Box, Button, CardHeader } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import SpaceUserSettings from './SpaceUserSettings';
import SpacePersonalSettings from './SpacePersonalSettings';
import RoleManagement from './RoleManagement';
import SpaceGeneralSettings from './SpaceGeneralSettings';
import {useSelector} from 'react-redux';
import { useSpring, animated, } from "react-spring";
import { updateSpaceUser, updateSpace, resetSpace} from '../../../actions/orgActions';
import { updateSpaceRoles } from '../../../actions/roleActions';
import { useLocation } from 'react-router';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}
function BottomPopUp({children, open, cancel}) {
    const styles = useSpring({
        from: { y: 50 },
        to: { y: 0 },
        reverse: !open,
        config: {
            tension: 200,
            friction: 20,
          }
    })
    return (
      <animated.div
        style={{    
            width: '100%',    
          ...styles,
        }}
      >
          {children}
      </animated.div>
    )
  }

export default function SpaceSettings() {
    const dispatch = useDispatch();
    const {
        currSettingsPage,
        editedSpace,
        editedSpaceUser,
        currSpace,
        mobile,
        spaceEdited,
        spaceUserEdited,
        changedRoles,
        editedRoles
    } = useSelector(state => ({...state.orgActions, ...state.uiActions}));
    const [state, setState] = React.useState({
        loadingSave: false,
        intialLoad: false
    });
    const location = useLocation();

    
    const saveSpace = () => {
        setState({
            ...state,
            loadingSave: true,
        })
        if (spaceEdited) {
            dispatch(updateSpace(editedSpace)).then(() => {
                
            });
        }
        if (spaceUserEdited) {
            dispatch(updateSpaceUser(currSpace.space_id, editedSpaceUser)).then(() => {
                
            });
        }
        if (changedRoles.length > 0) {
            dispatch(updateSpaceRoles(currSpace.space_id, editedRoles)).then(() => {
                
            });
        }
        setState({
            ...state,
            loadingSave: false,
        })
    }
    
    const cancelChanges = () => {
        dispatch(resetSpace());
        
    }

    React.useEffect(() => {
        if (spaceEdited || spaceUserEdited || changedRoles.length > 0) {
            setState({
                ...state,
                intialLoad: true
            })
        }
    }, [spaceEdited, spaceUserEdited, changedRoles.length])
    return (
        <div style={{position: 'relative'}}>
            <div style={{paddingBottom: '100px', width: '100%'}}>
                <div style={{width: mobile ? '' : 800, position: 'relative'}}>
                    <TabPanel value={currSettingsPage} index={0}>                        
                        <SpaceGeneralSettings/>
                    </TabPanel>
                    <TabPanel value={currSettingsPage} index={1}>
                        <SpacePersonalSettings/>
                    </TabPanel>
                    <TabPanel value={currSettingsPage} index={2}>
                        <SpaceUserSettings/>
                    </TabPanel>
                    <TabPanel value={currSettingsPage} index={3}>
                        <RoleManagement/>
                    </TabPanel>
                </div>
                    {
                        (spaceEdited || spaceUserEdited || changedRoles.length > 0) && state.intialLoad &&
                        <div style={{position: 'fixed', right: 0, bottom: 10, width: '100%', display: 'flex', justifyContent: 'center', paddingLeft: 20, paddingRight: 20}}>
                            <BottomPopUp
                                open={spaceEdited || spaceUserEdited || changedRoles.length > 0}
                            >
                                <Card style={{minWidth: '75%', height: 50, boxShadow: 'none', border: 'solid', borderWidth: 1, borderColor: 'lightgrey'}}>
                                    <CardHeader
                                        title={
                                            <Typography>
                                                You have unsaved changes.
                                            </Typography>
                                        }
                                        action={
                                            <div style={{float: 'right', display: 'flex', alignContent: 'center', height: '100%'}}>
                                                <Button color="primary" variant='contained' onClick={saveSpace}>
                                                    <Save/> Save
                                                </Button>
                                                <Button style={{color: 'red', marginLeft: 5}} onClick={cancelChanges}>
                                                    Reset
                                                </Button>
                                                {state.loadingSave && <CircularProgress size={40} style={{marginLeft: '10px'}}/>}
                                            </div>
                                        }
                                    />
                                </Card>
                            </BottomPopUp>
                        </div>
                    }
                </div>
        </div>
    )
}