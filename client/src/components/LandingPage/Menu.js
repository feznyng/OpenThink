import { AppBar, Divider, Drawer, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import {Menu as MenuIcon} from '@material-ui/icons';
import {setMenuHeight} from '../../actions/uiActions';
import { useAppSelector } from '../../Store';
import Button from '../Shared/Button';
import { paperColor } from '../../theme';

const options = [
    {
        title: 'Platform',
        options: [],
        link: '/'
    },
    {
        title: 'Organizations',
        options: [],
        link: '/organizations'
    },
    /*
    {
        title: 'Blog',
        options: [],
        link: '/blog'
    },
    */
   /*
    {
        title: 'Help',
        options: [],
        link: '/help'
    },
    */
    {
        title: 'About Us',
        options: [],
        link: '/about'
    }
]

export default function Menu() {
    const dispatch = useDispatch();
    const history = useHistory();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const [state, setState] = React.useState({
        open: false
    })

    const menuRef = React.useRef();

    React.useEffect(() => {
        if (menuRef.current) {
          dispatch(setMenuHeight(menuRef.current.offsetHeight))
        }
    }, [menuRef])


  const darkMode = useAppSelector(state => state.user.darkMode)
  const darkColor = '#424242';
    return (
        <div style={{height: 60}}>
            <div ref={menuRef} style={{backgroundColor: darkMode ? paperColor : 'white', position: 'fixed', top: 0, width: '100%', zIndex: 10}}>
                <div style={{height: 60, position: 'relative'}}>
                    <div style={{marginLeft: 10, position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
                        {
                            !matches &&
                            <IconButton
                                onClick={() => setState({...state, open: true})}
                            >
                                <MenuIcon/>
                            </IconButton>
                        }
                        <img
                            alt=""
                            style={{height: 40, marginLeft: -10, cursor: 'pointer'}}
                            onClick={() => history.push('/')}
                            src="/assets/main/main_title.svg"
                        />
                        {
                            matches && 
                            <div style={{height: '100%', display: 'flex', alignItems: 'center', width: '100%'}}>
                                {
                                    options.map(o => (
                                        <Button
                                            style={{textTransform: 'none', textDecoration: 'none', textDecorationColor: 'none'}} 
                                            size="large"
                                            onClick={() => history.push(o.link)}
                                        >
                                            {o.title}
                                        </Button>
                                    ))
                                }
                            </div>
                        }
                        
                    </div>
                    
                    <div style={{paddingRight: matches ? 30 : 10, position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
            
                            <React.Fragment>
                                <Button
                                    size={matches ? "medium" : 'small'}
                                    style={{marginRight: matches ? 20 : 5}}
                                    onClick={() => history.push('/signin')}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    size={matches ? "medium" : 'small'}
                                    color="primary"
                                    style={{borderRadius: 20}}
                                    onClick={() => history.push('/signup')}
                                >
                                    Sign Up
                                </Button>
                            </React.Fragment>
                    </div>
                </div>
                <Drawer open={state.open} onClose={() => setState({...state, open: false,})}>
                    <div style={{minWidth: 300, padding: 20}}>
                        <Button
                            style={{marginRight: 20}}
                            onClick={() => history.push('/signin')}
                            fullWidth
                        >
                            Log In
                        </Button>
                        <Button
                            variant="contained"
                            disableElevation
                            color="primary"
                            style={{borderRadius: 20}}
                            onClick={() => history.push('/signup')}
                            fullWidth
                        >
                            Sign Up
                        </Button>
                        <Divider style={{marginTop: 10, marginBottom: 5}}/>
                        <div>
                            {
                                options.map(o => (
                                    <Button 
                                        style={{textTransform: 'none', textDecoration: 'none', textDecorationColor: 'none'}} 
                                        size="large"
                                        onClick={() => {
                                            setState({...state, open: false,})
                                            history.push(o.link)
                                        }}
                                        fullWidth
                                    >
                                        {o.title}
                                    </Button>
                                ))
                            }
                        </div>
                    </div>
                </Drawer>
            </div>
        </div>
    )
}
