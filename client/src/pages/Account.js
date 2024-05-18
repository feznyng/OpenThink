import React from 'react'
import store from '../Store';
import ProfileHeader from '../components/User/ProfileHeader';
import AccountInfo from '../components/User/AccountInfo';
import {getUserPage} from '../actions/userActions'
import { useDispatch, useSelector } from "react-redux";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import withWidth from '@material-ui/core/withWidth';
import { Card } from '@material-ui/core';


function Account(props) {
  const {
    userInfo,
    currUser
  } = useSelector(state => state.userActions)
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getUserPage(userInfo.user_id)).then(() => {
      
    }) 
  }, []);
  
  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
        {
            currUser &&
            <div style={{width: '100%'}}>
                <Card style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <div style={{maxWidth: 900, width: '100%'}} >
                        <ProfileHeader/>
                    </div>
                </Card>
                <div style={{marginTop: 10}}>
                    <AccountInfo
                      user={userInfo}
                    />
                </div>
            </div>

        }
        
    </div>
  )
}

export default withWidth()(Account);