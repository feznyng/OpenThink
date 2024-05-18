
import { IconButton, Typography } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import 'react-contexify/dist/ReactContexify.css';
import { usePreloadedQuery } from 'react-relay';
import { useHistory } from 'react-router-dom';
import DirectMessagesList from './DirectMessagesList';

interface DirectMessagesColumnProps {
    queryRef: any
}

export default function UserColumn({queryRef}: DirectMessagesColumnProps) {
    const {me} = usePreloadedQuery<any>(    
        graphql`      
            query UserColumnQuery($roomCount: Int, $roomCursor: String) {   
                me {
                    firstname
                    ...DirectMessagesList_rooms
                }
            }
        `,    
        queryRef
    );

    const history = useHistory();

    return (
        <div>
            <div style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                {
                    /*
                    <ListItem 
                        button
                        onClick={() => history.replace('/messages/@me')}
                        style={{borderRadius: 10,}}
                        selected={history.location.pathname === '/messages/@me/connections'}
                    >
                        <ListItemIcon>
                            <People/>
                        </ListItemIcon>
                        <ListItemText
                            style={{marginLeft: -15}}
                            primary="Connections"
                        />
                    </ListItem>
                    
                    */
                }
                
                <div
                    style={{marginTop: 10}}
                >
                    <div style={{position: 'relative'}}>
                        <Typography style={{paddingLeft: 10, marginBottom: -5}} variant="subtitle2">
                            Direct Messages
                        </Typography>
                        <IconButton 
                            size="small" 
                            style={{position: 'absolute', top: -5, right: 0}}
                            onClick={() => history.replace(`/messages/@me/create`)}
                        >
                            <Add/>
                        </IconButton>
                    </div>
                    <DirectMessagesList
                        me={me}
                    />
                </div>
            </div>
            
        </div>
    )
}
