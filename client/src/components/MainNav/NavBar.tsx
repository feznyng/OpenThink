import { Paper, Tooltip, Menu } from '@material-ui/core'
import { Suspense, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import Button from '../Shared/Button'
import UserIcon from '../User/UserIcon'
import options from './MainNavOptions'
import graphql from 'babel-plugin-relay/macro';
import { usePreloadedQuery } from 'react-relay';
import { NavBarQuery } from './__generated__/NavBarQuery.graphql'
import ProfileOverlay from './ProfileOverlay'

interface NavBarProps {
    queryRef: any
}

export default function NavBar({queryRef}: NavBarProps) {
    const {me} = usePreloadedQuery<NavBarQuery>(    
        graphql`      
            query NavBarQuery {   
                me {
                  firstname
                  unreadMessages
                  unreadMessagesNum
                  darkMode
                  ...UserIconFragment
                }
            }
        `,    
        queryRef
      ); 

    const history = useHistory()
    const location = useLocation();
    const pathname = location.pathname
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <Paper style={{width: 65, height: '100vh', borderRadius: 0, position: 'relative'}}>
             {
                options.filter(o => o.link).map(({title, link, inactiveIcon, activeIcon}) => {
                    let selected = false;
                    if (link === '/') {
                       selected = link === pathname 
                    } else {
                        selected = !!(link && pathname.includes(link))
                    }
                    
                    return (
                        <Tooltip
                            title={title}
                            placement='right'
                        >
                            <span>
                                <Button
                                    onClick={() => link && history.push(link)} 
                                    fullWidth
                                    style={{marginTop: 10, height: 60, width: 60}}
                                    color={selected ? 'primary' : 'default'}
                                >
                                    {
                                        selected ?
                                        activeIcon
                                        :
                                        inactiveIcon
                                    }
                                </Button>
                            </span>
                        </Tooltip>
                    )
                })
            }
            
            <div style={{position: 'absolute', bottom: 0, left: 0, width: '100%'}}>
                <Button
                    onClick={(e) => setAnchorEl(e.currentTarget)} 
                    fullWidth
                    style={{marginTop: 10, height: 60, width: 60}}
                >
                    <UserIcon user={me}/>
                </Button>
            </div>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={!!anchorEl}
                onClose={handleClose}
              >
                {
                    anchorEl && 
                    <Suspense
                        fallback={<div/>}
                    >
                        <ProfileOverlay
                            onClose={handleClose}
                        />
                    </Suspense>
                 
                }
              </Menu>
        </Paper>
    )
}
