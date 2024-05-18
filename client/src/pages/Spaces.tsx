import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, useMediaQuery } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import SpaceSidebar from '../components/Space/SpaceSidebar';
import {useParams} from 'react-router'
import { useTheme } from '@material-ui/styles';
import SpaceTopbar from '../components/Space/SpaceTopbar';
import { useAppSelector } from '../Store';
import SpaceCreator from '../components/Space/SpaceCreator';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { SpacesQuery } from './__generated__/SpacesQuery.graphql'
import SpaceList from '../components/Space/SpaceList'
import SpaceMap from '../components/SpaceExplorer/SpaceMap';
import SpaceMapQuery from '../components/SpaceExplorer/__generated__/SpaceMapQuery.graphql'
import SuspenseLoader from '../components/Shared/SuspenseLoader'

interface SpacesProps {
  queryRef: any
}

export default function Spaces({queryRef}: SpacesProps) {
  const { discoverGroups, discoverProjects, me } = usePreloadedQuery<SpacesQuery>(
    graphql`
      query SpacesQuery($myGroupCount: Int!, $myGroupCursor: String, $groupCount: Int!, $groupCursor: String, $projectCount: Int, $projectCursor: String, $myProjectCount: Int!, $myProjectCursor: String) {
        discoverGroups: spaces(first: $groupCount, after: $groupCursor, filters: {project: false, memberOf: false, excludeChildren: true}) {
          edges {
            node {
              spaceId
            }
          }
          ...SpaceListFragment
        }
        discoverProjects: spaces(first: $projectCount, after: $projectCursor, filters: {project: true, memberOf: false}) {
          edges {
            node {
              spaceId
            }
          }
          ...SpaceListFragment
        }
        me {
          groups: spaces(first: $myGroupCount, after: $myGroupCursor, filters: {project: false, excludeChildren: true}) {
            edges {
              node {
                spaceId
              }
            }
            ...SpaceListFragment
          }
          projects: spaces(first: $myProjectCount, after: $myProjectCursor, filters: {project: true}) {
            edges {
              node {
                spaceId
              }
            }
            ...SpaceListFragment
          }
        }
      }
    `,
    queryRef
  )

  
  const [state, setState] = useState({
    open: false,
  })
  const history = useHistory();
  const mobile = useAppSelector(state => state.uiActions.mobile)
  const theme = useTheme();
  const small = useMediaQuery((theme as any).breakpoints.down('sm'));
  const { spacePage } = useParams<any>()

  const onCreate = (spaceId: number) => {
    history.push(`/space/${spaceId}`)
  }

  let spaces = discoverGroups
  let emptyMessage = "You've joined every group on OpenThink. "
  switch(spacePage) {
    case 'projects':
      spaces = discoverProjects
      emptyMessage = "You've joined every project on OpenThink. "
      break
    case 'my-groups':
      spaces = me!!.groups
      emptyMessage = "You haven't joined any groups on OpenThink."
      break
    case 'my-projects':
      spaces = me!!.projects
      emptyMessage = "You haven't joined any projects on OpenThink."
      break
  }

  const [mapQueryRef, loadMap] = useQueryLoader(SpaceMapQuery)

  useEffect(() => {
    if (spacePage === 'map') {
      loadMap({spaceCount: 1000000})
    }
  }, [spacePage])

  return (
    <div>
      <SpaceTopbar
        style={{width: '100%'}}
        createGroup={() => setState({...state, open: true})}
      />
      <div style={{width: '100%', display: 'flex', justifyContent: 'center', maxHeight: '100%'}}>
        {
          spacePage === 'map' ?
          <SuspenseLoader
            queryRef={mapQueryRef}
            fallback={<div/>}
          >
            <SpaceMap
              queryRef={mapQueryRef}
            />
          </SuspenseLoader>
          :
          <SpaceList
            spaces={spaces}
            emptyMessage={emptyMessage}
            grid
            style={{paddingLeft: 20, paddingRight: 20, paddingTop: 20, width: '100%'}}
          />
        }
      </div>
      {
        state.open && 
        <SpaceCreator
          open={state.open}
          fullScreen={mobile}
          onCreate={onCreate}
          onClose={() => setState({...state, open: false})}
        />
      }
    </div>
      
  )
}
