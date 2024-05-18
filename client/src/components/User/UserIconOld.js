import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import { getImage } from '../../actions/S3Actions';
import {useHistory} from 'react-router-dom'
import { Tooltip, Badge, Popover, Typography } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';    

export default function UserIcon(props) {
    const {user, size, readonly, displayStatus, linkDisabled, hide, style} = props;
    const [state, setState] = React.useState({
        anchorEl: false
    });
    const history = useHistory();
  
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('sm'));
    
    if (!user) {
        return (<div></div>)
    }

      
    let badgeLabel = (<span></span>);
    let imageURL = '';
    if (user && user.profilepic !== null && user.profilepic !== '') {
        imageURL = getImage(user.profilepic);
    }

    if (displayStatus) {
        if (user && user.status) {
            badgeLabel = (<span class={user.status} style={{width: size / 3,  height: size / 3}}></span>)
        } else {
            badgeLabel = (<span class='inactive' style={{width: size / 3,  height: size / 3}}></span>)
        }
    }

    return ( 
        <Tooltip title={hide ? '' : `${user.firstname} ${user.lastname}`}>
            <Badge
                 overlap="circle"
                 anchorOrigin={{
                   vertical: 'bottom',
                   horizontal: 'right',
                 }}
                 badgeContent={badgeLabel}
               >        
                <div onClick={(e) => { 
                    if (!readonly) {
                        e.preventDefault(); 
                        if (matches && !linkDisabled) {
                            history.push(`/profile/${user.user_id ? user.user_id : user.userId}`)
                            
                        } else {
                            setState({
                                ...state,
                                anchorEl: e.currentTarget,
                            })
                        }
                    }
                }}>
                    {
                        imageURL === '' ? 
                        <Avatar 
                            style={{width: size, height: size, ...style}}
                        >
                            <div style={{fontSize: '15px'}}>
                            {(`${user.firstname} ${user.lastname}`).split(" ").map((n)=>n[0]).join("")}
                            </div>
                        </Avatar>
                        :
                        <div>
                            <Avatar 
                                src={imageURL}  
                                style={{width: size, height: size, padding: 2, ...style}}
                            />
                        </div>
                        
                    }
                </div>
            </Badge> 
        </Tooltip>
        
    )
}
