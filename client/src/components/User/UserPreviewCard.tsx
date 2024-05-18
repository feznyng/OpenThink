import { CardContent } from '@material-ui/core'
import React from 'react'
import UserIcon from './UserIcon';
import ConnectButton from './ConnectButton'
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { UserPreviewCardQuery } from './__generated__/UserPreviewCardQuery.graphql';
import Typography from '../Shared/Typography';
import UserName from './UserName';
import UserMessageButton from '../Message/UserMessageButton';

interface UserPreviewCardProps {
    userId: number,
}


export default function UserPreviewCard({userId}:  UserPreviewCardProps) {
    const {user, me} = useLazyLoadQuery<UserPreviewCardQuery>(    
        graphql`      
            query UserPreviewCardQuery($id: ID!) {   
                user(userId: $id) {
                    userId
                    profilepic
                    bannerpic
                    firstname
                    lastname
                    bio
                    connection {
                        user1Id
                        user2Id
                        accepted
                    }
                    ...ConnectButtonFragment_connection
                    ...UserMessageButtonFragment_user
                    ...UserNameFragment
                    ...UserIconFragment
                }
                me {
                    userId
                    ...UserMessageButtonFragment_me
                }
            }
        `,    
        {id: userId.toString()}
    );

    const isCurrUser = me?.userId == user?.userId;

    return (
        <React.Fragment>
            {
                user && 
                
                    <div style={{width: 400, minHeight: isCurrUser ? 120 : 190, position: 'relative'}}>
                        <CardContent style={{textAlign: 'left', display: 'flex', alignItems: 'center', marginTop: 0}}>
                            <UserIcon
                                user={user}
                                size={80}
                            />
                            <div style={{marginLeft: 20}}>
                                <UserName
                                    style={{cursor: 'pointer'}} 
                                    variant="h5"
                                    user={user}
                                />
                                {
                                    user.bio &&
                                    <Typography variant="body1">{user.bio}</Typography>
                                }
                            </div>
                        </CardContent>
                            <div style={{position: 'absolute', bottom: 15, width: '100%', paddingLeft: 15, paddingRight: 15}}>
                                <div style={{display: 'flex', alignItems: "center", width: '100%'}}>
                                    {
                                        !isCurrUser && 
                                        <React.Fragment>
                                            <ConnectButton
                                                userData={user}
                                                style={{width: '100%', marginRight: 10}}
                                                fullWidth
                                            />
                                            <UserMessageButton
                                                style={{width: '100%'}}
                                                fullWidth
                                                userData={user}
                                                meData={me}
                                            />
                                        </React.Fragment>
                                        
                                    }
                                    {
                                        /*
                                            <Button
                                                variant="contained"
                                                style={{marginLeft: 10}}
                                            >
                                                <MoreHoriz/>
                                            </Button>
                                        */
                                    }
                                </div>
                                
                            </div>
                    </div>
            }
        </React.Fragment>
        
    )
}
