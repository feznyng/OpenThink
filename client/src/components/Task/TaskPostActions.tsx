import React from 'react'
import Button from '../Shared/Button';
import { Close, Link, MoreHoriz, Share, ThumbUpOutlined } from '@material-ui/icons';
import { IconButton, Menu, Snackbar, Tooltip } from '@material-ui/core';
import { textSecondary } from '../../theme';
import {useLocation} from 'react-router'

interface TaskPostActionsProps {
    data: any,
    onClose: () => void, 
    createSubtask: () => void
}

const actionIconSize = 20;
const actionButtonSize = actionIconSize + 10;

const actionIconStyle = {color: textSecondary, fontSize: actionIconSize}
const actions = [
    
    /*
    {
        title: 'Attachments',
        icon: <AttachFileOutlined style={{...actionIconStyle}}/>
    },
    */
    {
        title: 'Subtasks',
        icon: <Share style={{transform: 'rotate(90deg)', ...actionIconStyle}}/>
    },
    {
        title: 'Copy task link',
        icon: <Link style={{...actionIconStyle}}/>
    },
    /*
    {
        title: 'More actions',
        icon: <MoreHoriz style={{...actionIconStyle}}/>
    },
    */
    {
        title: 'Close',
        icon: <Close style={{...actionIconStyle}}/>
    },
]



export default function TaskPostActions({onClose, createSubtask}: TaskPostActionsProps) {
    const [state, setState] = React.useState({
        open: false,
        anchorEl: null
    })
    const location = useLocation();
    const postAction = (title: string, e: any) => {
        switch (title) {
            case 'Like this': {
                
                break;
            }
            case 'Attachments': {
                break;
            }
            case 'Subtasks': {
                createSubtask();
                break;
            }
            case 'Copy task link': {
                const link = location.pathname;
                navigator.clipboard.writeText(link);
                setState({...state, open: true})
                break;
            }
            case 'More actions': {
                setState({...state, anchorEl: e.currentTarget})
                break;
            }
            case 'Close': {
                onClose();
                break;
            }
            default: console.log('case not handled')
        }
    }

    const handleClose = () => setState({...state, open: false,})

    return (
        <div
            style={{display: 'flex'}}
        >
            {
                actions.map(({icon, title}) => (
                    <Tooltip
                        title={title}
                    >
                        <div>
                            <Button
                                size="small"
                                disableElevation
                                onClick={(e) => postAction(title, e)}
                                style={{maxWidth: actionButtonSize, maxHeight: actionButtonSize, minWidth: actionButtonSize, minHeight: actionButtonSize, marginLeft: 5}}
                            >
                                {icon}
                            </Button>
                        </div>
                    </Tooltip>
                ))
            }
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              open={state.open}
              autoHideDuration={6000}
              onClose={handleClose}
              message="Link copied to clipboard"
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                    <Close fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
        </div>
    )
}
