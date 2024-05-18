import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { useFragment, useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import UserSpaces from './UserGroups';
import UserGroupsQuery from './__generated__/UserGroupsQuery.graphql'
import UserProjectsQuery from './__generated__/UserProjectsQuery.graphql'
import UserAboutQuery from './__generated__/UserAboutQuery.graphql'
import UserConnectionsQuery from './__generated__/UserConnectionsQuery.graphql'
import SuspenseLoader from '../Shared/SuspenseLoader';
import UserProjects from './UserProjects';
import UserAbout from './UserAbout';
import UserConnections from './UserConnections';

interface AccountInfoProps {
  user: any,
  page?: string,
  style?: React.CSSProperties
}

export default function AccountInfo({user, page, ...props}: AccountInfoProps) {
  const {userId} = useFragment(
    graphql`
      fragment AccountInfoFragment on User {
        userId
      }
    `,
    user
  )

  const [
    groupsQueryRef,
    loadGroups
  ] = useQueryLoader(
    UserGroupsQuery
  )

  const [
    projectsQueryRef,
    loadProjects
  ] = useQueryLoader(
    UserProjectsQuery
  )

  const [
    aboutQueryRef,
    loadAbout
  ] = useQueryLoader(
    UserAboutQuery
  )

  const [
    connectionsQueryRef,
    loadConnections
  ] = useQueryLoader(
    UserConnectionsQuery
  )

  const pages = [
    {
      value: undefined,
      Page: UserSpaces,
      queryRef: groupsQueryRef
    },
    {
      value: 'projects',
      Page: UserProjects,
      queryRef: projectsQueryRef
    },
    {
      value: 'about',
      Page: UserAbout,
      queryRef: aboutQueryRef
    },
    {
      value: 'connections',
      Page: UserConnections,
      queryRef: connectionsQueryRef
    }
  ]

  const currPage = pages.find((userPage) => userPage.value === page)!!

  React.useEffect(() => {
    const commonVars = {userId}
    switch(page) {
      case undefined: 
        loadGroups({...commonVars, spaceCount: 20})
        break;
      case 'projects': 
        loadProjects({...commonVars, spaceCount: 20})
        break;
      case 'about': 
        loadAbout({...commonVars, skillCount: 20})
        break;
      case 'connections': 
        loadConnections({...commonVars, connectionCount: 20})
        break;
    }
  }, [page])

  return (
    <div
      {...props}
    >
      {
        currPage && 
        <SuspenseLoader
          queryRef={currPage.queryRef}
          fallback={<div style={{display: 'flex', justifyContent: 'center'}}><CircularProgress/></div>}
        >
          <currPage.Page queryRef={currPage.queryRef}/>
        </SuspenseLoader>
      }
     
      {
        /*
         <UserSpaces
        
        />
      {
        page === 'projects' && 
        <UserProjects
          profile={profile}
          readonly={!userInfo || currUser.user_id === userInfo.user_id}
        />
      }
      {
        page === 'about' && 
        <UserAbout/>
      }
      {
        page === 'connections' && 
        <UserConnections/>
      }
      {
        page === 'events' && 
        <UserEvents
          user={currUser}
        />
      }
      {
        page === 'questions' && 
        <UserQuestions
          user={currUser}
        />
      }
      {
        page === 'tasks' && 
        <UserTasks/>
      }
        
        */
      }
      
    </div>
  )
}
