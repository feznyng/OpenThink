import { Card, CardContent, Divider } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import { uniqueId } from 'lodash';
import React, { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { useHistory, useLocation, useParams } from 'react-router';
import { scrollToWithOffset } from '../../utils/domutils';
import { queryString } from '../../utils/urlutils';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import SpaceMain from './SpaceMain';
import SpaceNav, { tabs } from './SpaceNav';
import SpaceSettings from './SpaceSettings';
import SpaceTabs from './SpaceTabs';

interface GeneralSpaceViewProps {
    data: any,
    me: any,
}
export default function GeneralSpaceView({data, me}: GeneralSpaceViewProps) {
    const {spaceId, ...space} = useFragment(    
        graphql`      
            fragment GeneralSpaceViewFragment on Space {
                spaceId
                ...SpaceMainFragment
                ...SpaceNavFragment
                ...SpaceTabsFragment
            }
        `,
        data
    );
    
    const currUser = useFragment(
        graphql`
            fragment GeneralSpaceViewFragment_me on User {
                ...SpaceNavFragment_me
                ...SpaceMainFragment_me
                ...SpaceTabsFragment_me
                productivityView
            }
        `,
        me
    )

    const { spacePage } = useParams<any>();
    const location = useLocation();
    const {fullscreen} = queryString.parse(location.search);

    const compactMode = currUser?.productivityView

    const history = useHistory()
    useEffect(() => {
        setTimeout(() => {
            if (spacePage && !tabs.find(({value}) => value === spacePage) && spacePage !== 'post'){
                console.log('here')
                history.replace(`/space/${spaceId}`);

            }
        }, 1000)
        
    }, [])


    React.useEffect(() => {
        scrollToWithOffset("current-space-icon", 70)
    }, [])

    return (
        <div style={{height: '100%', width: '100%'}}>   
            {
                spacePage !== 'post' && !fullscreen && 
                <div style={{flexShrink: 0, flexGrow: 0, height: '100%',}}>
                    <Card
                        style={{borderStartEndRadius: 0, borderStartStartRadius: 0, borderRadius: compactMode ? 0 : undefined, width: '100%'}}
                    >
                        <MaxWidthWrapper
                            width={900}
                        >
                            <CardContent style={{position: 'relative'}}>
                                <SpaceMain 
                                    space={space}
                                    user={currUser}
                                />
                                <div style={{height: 20}}/>
                                <div style={{position: 'absolute', bottom: 0, left: 0, width: '100%'}}>
                                <Divider/>
                                <SpaceNav
                                    space={space}
                                    me={currUser}
                                />
                                </div>
                            </CardContent>
                        </MaxWidthWrapper>
                    </Card>
                </div>
            }
            <div style={{height: '100%', marginTop: (spacePage === 'post' || compactMode) ? 0 : 15, minHeight: 800}}>
                <SpaceTabs
                    space={space}
                    user={currUser}
                />
            </div>
            {
                spacePage === 'settings' && 
                <SpaceSettings
                    spaceId={spaceId}
                    fetchKey={uniqueId()}
                />
            }
            
        </div>
    )
}
