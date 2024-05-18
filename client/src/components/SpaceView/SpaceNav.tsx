import { Card, Fade } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFragment } from 'react-relay';
import { useHistory, useParams } from 'react-router';
import Sticky from 'react-sticky-el';
import { RootState } from '../../Store';
import PostNavMenu from '../Post/PostNavMenu';
import GeneralTabs from '../Shared/GeneralTabs';
import SpaceMainActions from './SpaceMainActions';

export const tabs = [
    {
        title: "About",
        value: 'about'
    },
    {
        title: "Home",
        value: '',
        default: true
    },
    {
        title: "People",
        value: 'people'
    },
    {
        title: "Goals",
        value: 'goals'
    },
    {
        title: "Tags",
        value: 'tags'
    },
    {
        title: "Rooms",
        value: 'rooms'
    },
    {
        title: "Events",
        value: 'events'
    },
    {
        title: "Tasks",
        value: 'tasks'
    },
    {
        title: "Files",
        value: 'files'
    },
    {
        title: "Groups",
        value: 'groups',
        hideInProject: true
    }, 
    {
        title: "Projects",
        value: 'projects',
        hideInProject: true
    },
]
interface SpaceNavProps {
    space: any,
    me: any
}

export default function SpaceNav({space, me}: SpaceNavProps) {
    const {spaceId, project, ...data} = useFragment(
        graphql`
          fragment SpaceNavFragment on Space {
            ...SpaceMainActionsFragment
            spaceId
            project
          }
        `,
        space
    )

    const meData = useFragment(
        graphql`
            fragment SpaceNavFragment_me on User {
                darkMode
                productivityView
            }
        `,
        me
    )
    
    const {
        menuHeight,
    } = useSelector((state: RootState) => ({...state.uiActions, ...state.orgActions}))

    const [state, setState] = React.useState({
        initialLoaded: false,
        fixed: false,
    })

    const {
        spacePage
    } = useParams<any>();

    const history = useHistory();

    const changeTab = (value: string) => {
        history.replace(`/space/${spaceId}/${value}`);
    }

    const compactLayout = meData?.productivityView


    return (
        <Sticky 
            stickyStyle={{top: compactLayout ? 0 : menuHeight, zIndex: 1000}} 
            topOffset={compactLayout ? 0 : -(menuHeight - 3)} 
            onFixedToggle={(fixed) => {
                setState({...state, fixed})
            }}
            disabled
            positionRecheckInterval={1}
        >
            <div>
            {
                (state.fixed) ? 
                <Fade in={true} timeout={300}>
                    <Card style={{width: '100%', height: 55, borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                        <div style={{display: 'flex', justifyContent: 'center', position: 'relative', minWidth: '100%', height: '100%'}}>
                            <div style={{maxWidth: 900, width: "100%", height: '100%', display: 'flex', alignItems: 'center', minWidth: 200}}>
                                <PostNavMenu
                                    parentType={'space'}
                                    inGroup
                                    id={spaceId}
                                />
                                <SpaceMainActions
                                    space={data}
                                />
                            </div>
                        </div>
                        
                    </Card>
                </Fade>
                :
                <div>
                    <div style={{display: 'flex', justifyContent: 'center', position: 'relative'}}>
                        <div style={{maxWidth: 900, width: "100%", overflow: 'auto'}}>
                            <GeneralTabs
                                tabs={tabs.filter(t => (!project || !t.hideInProject))}
                                onClick={changeTab}
                                tabProps={compactLayout ? {
                                    variant: 'small',
                                    style: {justifyContent: "flex-start", minWidth: 0}
                                } : {}}
                                selected={spacePage ? spacePage : ''}
                            />
                        </div>
                    </div>
                </div>
            }
            </div>
        </Sticky>
    )
}
