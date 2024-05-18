import React from 'react'
import {CardContent, OutlinedInput, Button, Snackbar, IconButton} from '@material-ui/core';
import {Add, Close} from '@material-ui/icons';

import UserIcon from '../../User/UserIconOld';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';

export default function DiscussionCreator(props) {
    const {onSubmit, user, isSmall, shortened} = props;
    const [body, setBody] = React.useState('');
    const [open, setOpen] = React.useState(false);

    const history = useHistory();
    const {
      jwt
    } = useSelector(state => ({...state.userActions}))
    return (
        <div>
           <CardContent style={{marginTop: -10, marginBottom: -15}}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: '10px', marginLeft: '-5px'}}>
                  <UserIcon  size={38} user={user}></UserIcon>
                </span>
                <OutlinedInput 
                  variant="outlined"
                  value={body} 
                  onKeyPress={(e) => {if (e.shiftKey && e.key === 'Enter') {setOpen(true); onSubmit(body); setBody(''); e.preventDefault()}}}
                  placeholder="Reply..." 
                  onChange={(e) => setBody(e.target.value)} 
                  style={{width: '100%', marginRight: '10px', borderRadius: '25px', height: 40}} 
                  multiline
                  onClick={() => !jwt && history.push('/signup')}
                />
                {
                  !isSmall &&
                  <Button  disabled={body === ''}onClick={() => {setBody(''); setOpen(true); onSubmit(body)}} style={{borderRadius: '25px', height: '35px', fontSize: 12}} color="primary" variant="contained" ><Add/> {!shortened && 'Comment'}</Button>
                }
              </div>
              {
                isSmall &&
                <div style={{marginTop: '5px', float: 'right', marginRight: '10px'}}>
                  <Button disabled={body === ''} onClick={() => {
                    if (jwt) {
                      setBody(''); 
                      setOpen(true); 
                      onSubmit(body)
                    } else {
                      history.push('/signup')
                    }
                    
                  }} style={{borderRadius: '25px', height: '35px', fontSize: 12 }} color="primary" variant="contained" ><Add/> {!shortened && 'Comment'}</Button>
                </div>
              }
            </CardContent>
           
        </div>
    )
}
