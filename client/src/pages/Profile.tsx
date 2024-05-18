import React, { Suspense } from 'react'
import { useParams } from "react-router-dom";
import ProfileHeader from '../components/User/ProfileHeader';
import {Card, withWidth} from '@material-ui/core';
import AccountInfo from '../components/User/AccountInfo';
import {useHistory} from 'react-router-dom';
import { usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { ProfileQuery } from './__generated__/ProfileQuery.graphql';
import MaxWidthWrapper from '../components/Shared/MaxWidthWrapper';

interface ProfileProps {
    queryRef: any
}

function Profile(props: ProfileProps) {
    const {queryRef} = props;

    const {user, me} = usePreloadedQuery<ProfileQuery>(    
        graphql`      
            query ProfileQuery($id: ID!) {   
                user(userId: $id) {
                    userId
                    ...ProfileHeaderFragment_user
                    ...AccountInfoFragment
                }
                me {
                    userId
                    ...ProfileHeaderFragment_me
                }
            }
        `,    
        queryRef
    );

    const history = useHistory();

    React.useEffect(() => {
        window.scroll(0, 0)
    }, [user?.userId])

    const {userPage} = useParams<any>()
   
    return (
        <div style={{display: 'flex', justifyContent: 'center'}}>
            {
                user &&
                <div style={{width: '100%'}}>
                    <Card style={{width: '100%',}}>
                        <MaxWidthWrapper
                            width={900}
                        >
                            <ProfileHeader
                                profile
                                userData={user}
                                meData={me}
                            />
                        </MaxWidthWrapper>
                    </Card>
                    <Suspense
                        fallback={<div/>}
                    >
                        <AccountInfo
                            user={user}
                            page={userPage}
                            style={{marginTop: 15, paddingBottom: 20}}
                        />
                    </Suspense>
                </div>
            }
            
        </div>
    )
}

export default withWidth()(Profile);