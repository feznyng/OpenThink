import React from 'react';
import UserIcon from '../../User/UserIconOld';
import {Card, CardContent, CardMedia, Typography, CardHeader, Avatar, Chip  } from '@material-ui/core';
import {LocationOn} from '@material-ui/icons';
import {timeAgo} from '../../../utils/dateutils';
import PostIcon from '../../Post/PostIconOld';
import JoinButton from '../JoinButtonOld'

import SpaceIcon from '../SpaceIconOld'
import {sanitizeBody} from '../../../utils/textprocessing';
import { getImage } from '../../../actions/S3Actions';
import { useLocation, Link } from 'react-router-dom';
import store from '../../../Store';
import BannerImage from '../../Shared/BannerImageOld';

    export default function SpaceListCard(props) {
        const {group} = props;
        const location = useLocation();
        const [state, setState] = React.useState({
            hover: false,
        });
        const card = (
            <div>
                <div style={{
                    padding: 5,
                    marginBottom: 5
                }}
                    onMouseEnter={() => setState({...state, hover: true})}
                    onMouseLeave={() => setState({...state, hover: false})}
                >
                    <Card style={{
                        transform: state.hover ? 'scale(1.01)' : '',
                        height: 125,
                        position: 'relative',
                        boxShadow: 'none'
                    }}>
                        <BannerImage
                            object={group}
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                        <div 
                            style={{
                                height: '100%',
                                width: '100%',
                                flexShrink: 0,
                                paddingLeft: 20,
                                paddingRight: 20,
                                display: 'flex',
                                alignItems: 'center',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5536415249693627) 0%, rgba(0,0,0,0.55) 100%)'
                            }}
                        >
                        <SpaceIcon organization={group} size={75}/>
                        <div style={{height: '100%', textAlign: 'left', padding: 20, marginTop: 10}}>
                            <Typography variant="h5" style={{color: 'white', marginBottom: 10}}>{group.name}</Typography>
                            <Typography variant="p" style={{color: 'white', marginBottom: 10}}>{group.description.substring(0, 65) + (group.description.length > 65 ? '...' : '')}</Typography>
                            {
                                group.address && 
                                <div style={{marginTop: 10, marginLeft: -3}}>
                                <Typography variant="p" style={{marginRight: 10, color: 'white'}}> <LocationOn/> {group.address}</Typography>
                                </div>
                            }
                        </div> 
                        </div>
                        <div style={{marginTop: 10, position: 'absolute', bottom: 5, right: 5}}>
                            
                        </div>
                        <div style={{marginTop: 10, position: 'absolute', top: 5, right: 10}}>
                            <JoinButton
                                organization={group}
                                icon
                                currUser={store.getState().userActions.userInfo}
                            />
                        </div>
                        
                    </Card>
                    
                </div>
            </div>
        )

        return (
            <Link style={{textDecoration: 'none'}} to={{pathname: `/space/${group.space_id}`, state: {from: location.pathname, clear: false, push: true}}}>
                {card}
            </Link>
        )
    }
