import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment, useQueryLoader } from 'react-relay';
import { useParams } from 'react-router';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { page } from '../../types/page';
import SpaceColumnQuery from '../Message/__generated__/SpaceColumnQuery.graphql';
import PostView from '../Post/PostView';
import PostViewQuery from '../Post/__generated__/PostViewQuery.graphql';
import BasicLoader from '../Shared/BasicLoader';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import SuspenseLoader from '../Shared/SuspenseLoader';
import { SpaceChannels } from './SpaceChannels';
import GroupCalendar from './SpaceEvents';
import SpaceFiles from './SpaceFiles';
import SpaceGoals from './SpaceGoals';
import SpaceGroups from './SpaceGroups';
import SpaceHome from './SpaceHome';
import SpaceInfo from './SpaceInfo';
import SpaceMessages from './SpaceMessages';
import SpaceUserBase from './SpacePeople';
import SpaceTags from './SpaceTags';
import SpaceTasks from './SpaceTasks';
import SpaceWiki from './SpaceWiki';
import SpaceChannelsQuery from './__generated__/SpaceChannelsQuery.graphql';
import SpaceEventsQuery from './__generated__/SpaceEventsQuery.graphql';
import SpaceGoalsQuery from './__generated__/SpaceGoalsQuery.graphql';
import SpaceGroupsQuery from './__generated__/SpaceGroupsQuery.graphql';
import SpaceHomeQuery from './__generated__/SpaceHomeQuery.graphql';
import SpaceInfoQuery from './__generated__/SpaceInfoQuery.graphql';
import SpacePeopleQuery from './__generated__/SpacePeopleQuery.graphql';
import SpaceTagsQuery from './__generated__/SpaceTagsQuery.graphql';
import SpaceTasksQuery from './__generated__/SpaceTasksQuery.graphql';
import SpaceWikiQuery from './__generated__/SpaceWikiQuery.graphql';
import SpaceFilesQuery from './__generated__/SpaceFilesQuery.graphql';

interface SpaceTabsProps {
    space: any,
    user: any,
}

const userCount = 20;
const spaceCount = 20;

export default function SpaceTabs({user, space}: SpaceTabsProps) {
    const {currUser, type, name, spaceId, ...data} = useFragment(
        graphql`
            fragment SpaceTabsFragment on Space {
                ...SpaceMainActionsFragment
                ...BannerImageFragment
                ...SpaceIconFragment
                ...VisibilityIconFragment
                currUser {
                    accepted
                    request
                    type
                }
                type
                spaceId
                name
            }
        `,
        space
    )

    const { height } = useWindowDimensions();

    const me = useFragment(
        graphql`
            fragment SpaceTabsFragment_me on User {
                productivityView
                userId
            }
        `,
        user
    )

    const compactView = me?.productivityView
    
    const {spacePage, spaceID, postID} = useParams<any>();

    const [    
        tasksQueryRef,    
        loadTasksQuery,  
    ] = useQueryLoader(    
        SpaceTasksQuery,    
    );

    const [    
        infoQueryRef,    
        loadInfoQuery,  
    ] = useQueryLoader(    
        SpaceInfoQuery,
    );

    const [    
        peopleQueryRef,    
        loadPeopleQuery,  
    ] = useQueryLoader(    
        SpacePeopleQuery,
    );

    const [    
        groupsQueryRef,    
        loadGroupsQuery,  
    ] = useQueryLoader(    
        SpaceGroupsQuery,    
    );

    const [    
        goalsQueryRef,    
        loadGoalsQuery,  
    ] = useQueryLoader(    
        SpaceGoalsQuery,    
    );

    const [    
        channelsQueryRef,    
        loadChannelsQuery,  
    ] = useQueryLoader(    
        SpaceChannelsQuery,    
    );

    const [    
        tagsQueryRef,    
        loadTagsQuery,  
    ] = useQueryLoader(    
        SpaceTagsQuery,    
    );

    const [    
        eventsQueryRef,    
        loadEventsQuery,  
    ] = useQueryLoader(    
        SpaceEventsQuery,    
    );


    const [    
        channelListQueryRef,    
        loadSpaceColumnQuery,  
    ] = useQueryLoader(    
        SpaceColumnQuery,    
    );

    const [    
        wikiQueryRef,    
        loadWikiQuery,  
    ] = useQueryLoader(    
        SpaceWikiQuery,
    );

    const [    
        homeQueryRef,    
        loadHomeQuery,  
    ] = useQueryLoader(    
        SpaceHomeQuery,
    );

    const [    
        postQueryRef,    
        loadPostQuery,  
    ] = useQueryLoader(    
        PostViewQuery,
    );

    const [    
        filesQueryRef,    
        loadFilesQuery,  
    ] = useQueryLoader(    
        SpaceFilesQuery,
    );

    const pages: page[] = [
        {
            title: 'about',
            fallback: <BasicLoader/>,
            queryRef: infoQueryRef,
            Page: SpaceInfo,
            width: 700, 
        },
        {
            title: undefined,
            fallback: <BasicLoader/>,
            width: 900,
            queryRef: homeQueryRef,
            Page: SpaceHome
        },
        {
            title: 'people',
            fallback: <BasicLoader/>,
            queryRef: peopleQueryRef,
            Page: SpaceUserBase,
            width: 700, 
        },
        {
            title: 'events',
            fallback: <BasicLoader/>,
            width: '100%',
            queryRef: eventsQueryRef,
            Page: GroupCalendar
        },
        {
            title: 'goals',
            fallback: <BasicLoader/>,
            width: '100%',
            queryRef: goalsQueryRef,
            Page: SpaceGoals
        },
        {
            title: 'tags',
            fallback: <BasicLoader/>,
            width: '100%',
            queryRef: tagsQueryRef,
            Page: SpaceTags
        },
        {
            title: 'tasks',
            fallback: <BasicLoader/>,
            width: '100%',
            queryRef: tasksQueryRef,
            Page: SpaceTasks
        },
        {
            title: 'wiki',
            fallback: <BasicLoader/>,
            queryRef: wikiQueryRef,
            Page: SpaceWiki,
        },
        {
            title: 'files',
            fallback: <BasicLoader/>,
            queryRef: filesQueryRef,
            width: 900,
            Page: SpaceFiles
        },
        {
            title: 'groups',
            fallback: <BasicLoader/>,
            queryRef: groupsQueryRef,
            props: {project: groupsQueryRef?.variables.project},
            Page: SpaceGroups,
            width: 700, 
        },
        {
            title: 'projects',
            fallback: <BasicLoader/>,
            queryRef: groupsQueryRef,
            props: {project: groupsQueryRef?.variables.project},
            Page: SpaceGroups,
            width: 700, 
        },
        {
            title: 'post',
            fallback: <BasicLoader/>,
            queryRef: postQueryRef,
            Page: PostView,
            width: '100%', 
        },
    ]

    pages.push(
        {
            title: 'rooms',
            fallback: <BasicLoader/>,
            width: '100%',
            queryRef: compactView ? channelListQueryRef : channelsQueryRef,
            Page: compactView ? SpaceMessages : SpaceChannels
        },
    )
    const currPage = pages.find(p => p.title === spacePage)
    const args = {id: parseInt(spaceID), spaceId: parseInt(spaceId)};

    React.useEffect(() => {
        switch (spacePage) {
            case 'about':
                loadInfoQuery({...args, tagCount: 30})
                break;
            case 'people':
                loadPeopleQuery({...args, userCount, stratified: true})
                break;
            case 'groups':
                loadGroupsQuery({...args, spaceCount, project: false,})
                break;
            case 'projects': 
                loadGroupsQuery({...args, spaceCount, project: true})
                break;
            case 'tasks':
                loadTasksQuery({...args, taskCount: 1000000});
                break;
            case 'rooms':
                if (compactView && !channelListQueryRef) {
                    loadSpaceColumnQuery({id: parseInt(spaceID), roomCount: 500})
                } else {
                    loadChannelsQuery({...args, roomCount: 20});
                }
                break;
            case 'tags':
                loadTagsQuery({...args, tagCount: 20});
                break;
            case 'goals':
                loadGoalsQuery({...args, postCount: 5, tagCount: 5, reactionCount: 30, taskCount: 0, userCount, stratified: true, sortBy: 'New'});
                break;
            case 'events':
                loadEventsQuery({...args, postCount: 5, tagCount: 5, reactionCount: 30, taskCount: 0, userCount, stratified: true, sortBy: 'New'});
                break;
            case 'wiki':
                loadWikiQuery({...args, wikiCount: 100});
                break;
            case 'files':
                loadFilesQuery({...args, postCount: 5, tagCount: 5, reactionCount: 30, taskCount: 0, userCount, stratified: true, sortBy: 'New'});
                break
            default:
                loadHomeQuery({...args, postCount: 5, tagCount: 5, reactionCount: 30, taskCount: 0, userCount, stratified: true, sortBy: 'New'}, {fetchPolicy: 'store-and-network'})
                break;
        }
    }, [currPage?.title])
    
    React.useEffect(() => {
        if (currPage && currPage.title === 'post') {
            loadPostQuery({...args, postId: postID, spaceId, postCount: 20, tagCount: 30, reactionCount: 30, taskCount: 10, pathCount: 10, sortBy: 'New'}, {fetchPolicy: 'store-and-network'})
            window.scrollTo(0, 0)
        }
    }, [postID])

    const windowHeight = height - 100;

    return (
        <React.Fragment>
            {
                currPage && 
                <MaxWidthWrapper
                    width={currPage?.width}
                >
                    <SuspenseLoader
                        fallback={currPage.fallback}
                        queryRef={currPage.queryRef}
                    >
                        <currPage.Page 
                            queryRef={currPage.queryRef} 
                            expanded={compactView} 
                            windowHeight={windowHeight}
                            {...currPage.props}
                        />
                    </SuspenseLoader>
                </MaxWidthWrapper>
            }
        </React.Fragment>
        
    )
}
