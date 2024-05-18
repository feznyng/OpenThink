import { DialogActions, DialogContent, DialogProps, DialogTitle } from '@material-ui/core'
import { GroupAdd } from '@material-ui/icons'
import React, { Suspense } from 'react'
import { space } from '../../types/space'
import Button from '../Shared/Button'
import Dialog from '../Shared/Dialog'
import MultiPageDialog from '../Shared/MultiPageDialog'
import Typography from '../Shared/Typography'
import GroupTypeSelector from './CreateGroupTypeSelector'
import CreateGroupTypeSelector from './CreateGroupTypeSelector'
import CreateProjectTypeSelector from './CreateProjectTypeSelector'
import SpaceGeneralSettings from './SpaceGeneralSettings'
import CreateSpaceInvite from './CreateSpaceInvite'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import type { SpaceCreatorQuery } from './__generated__/SpaceCreatorQuery.graphql'
import ConfirmInvites from '../InviteMenu/ConfirmInvites'
import SearchLoader from '../Shared/SearchLoader'
import { accessTypes, visibilityTypes } from '../../utils/spaceutils'
import ParamsInfoItem from './ParamsInfoItem'
import commitCreateSpace from '../../mutations/CreateSpace'
import { CreateSpaceMutation$data } from '../../mutations/__generated__/CreateSpaceMutation.graphql'

export interface SpaceCreatorPage {
    onChange: (space: any) => void,
    newSpace: any,
}

export interface SpaceCreatorProps {
    project?: boolean,
    parentSpaceId?: number,
    connectionIds?: string[],
    onCreate?: (spaceId: number) => void
}

interface SpaceCreatorState {
    space: any,
    nextDisabled?: boolean,
    pageIndex: number,
    creating: boolean
}

export default function SpaceCreator({parentSpaceId, connectionIds, onCreate, project, ...props}: SpaceCreatorProps & DialogProps) {
    const {space, me} = useLazyLoadQuery<SpaceCreatorQuery>(
        graphql`
            query SpaceCreatorQuery($parentSpaceId: Int, $root: Boolean!, $spaceId: Int, $connectionCount: Int!, $connectionCursor: String, $excludeRequested: Boolean!, $stratified: Boolean!, $userCount: Int!, $modCursor: String, $memberCursor: String) {
                space(spaceId: $parentSpaceId) @skip(if: $root) {
                    id
                    causes
                    name
                    type
                    accessType
                    address
                    latitude
                    longitude
                    project
                    ...CreateSpaceInviteFragment_space
                    ...ConfirmInvitesFragment
                }
                me {
                    ...CreateSpaceInviteFragment_user
                }
            }
        `,
        {parentSpaceId: parentSpaceId!!, root: !parentSpaceId, spaceId: parentSpaceId!!, stratified: false, userCount: 20, connectionCount: 20, excludeRequested: true}
    )



    const parent = space as any

    const [state, setState] = React.useState<SpaceCreatorState>({
        space: {
            parentSpaceId,
            project,
            projectType: 'General',
            accessType: 'Open',
            type: 'Public',
            name: '',
            description: '',
            spaceType: 'General',
            inviteAllSpaceMembers: false,
            address: parent?.address ? parent.address : '',
            latitude: parent?.latitude ? parent.latitude : null,
            longitude: parent?.longitude ? parent.longitude : null,
            causes: parent?.causes ? parent.causes : [],
            invitedUserIds: [],
            emails: [],
            invitedGroupIds: [],
            invitedRoleIds: []
        },
        nextDisabled: true,
        pageIndex: 0,
        creating: false
    })


    const pageProps = {
        onChange: (space: Partial<space>) => {
            const {name, causes, address} = space;
            let nextDisabled = false;
            if (state.pageIndex === 0 && (!name || !causes || causes.length === 0 || !address || address?.length === 0)) {
                nextDisabled = true;
            } else {
                nextDisabled = false;
            }

            setState({...state, space, nextDisabled})
        },
        newSpace: state.space
    }

    const pages = [
        {
            title: 'Type',
            projectOnly: true,
            page: 
                <CreateProjectTypeSelector 
                    {...pageProps}
                />
        },
        {
            title: 'General Settings',
            page: 
                <SpaceGeneralSettings 
                    {...pageProps}
                />
        },
        {
            title: `Invite People ${project ? ' and Groups' : ''}`,
            page: 
                <CreateSpaceInvite 
                    {...pageProps}
                    space={space}
                    user={me}
                />
        }
    ]

    const onPageChange = (pageIndex: number) => {
        setState({
            ...state,
            pageIndex
        })
    }
    
    let hint = '';

    if (((state.pageIndex === 1 && project) || (state.pageIndex === 0 && !project)) && state.nextDisabled) {
        hint = 'Please enter name, location, and cause.'
    }

    const createSpace = () => {
        commitCreateSpace(state.space, connectionIds ? connectionIds : [], {
            updater: (store: any) => {
                if (space?.id) {
                    const spaceRecord = store.get(space?.id)
                    if (spaceRecord) {
                        if (project) {
                            spaceRecord.setValue(spaceRecord.getValue("numProjects") + 1, "numProjects")
                        } else {
                            spaceRecord.setValue(spaceRecord.getValue("numSubgroups") + 1, "numSubgroups")
                        }
                    }
                }
            },
            onCompleted: ({createSpace}: CreateSpaceMutation$data) => {
                onCreate && createSpace?.spaceEdge?.node?.spaceId && onCreate(createSpace?.spaceEdge?.node?.spaceId)
            }
        })
        props.onClose!!(null as any, 'escapeKeyDown');
    }


    return (
        <MultiPageDialog
            {...props}
            title={`Create ${project ? 'Project' : 'Group'}`}
            pages={
                pages
                .filter(({projectOnly}) => !projectOnly || projectOnly && project)
                .map(({page, title}) => (
                    <div>
                        <Typography
                            style={{marginBottom: 15, fontWeight: 'bold'}}
                        >
                            {title}
                        </Typography>
                        {page}
                    </div>
                ))
            }
            completeButton={
                <Button
                    color='primary'
                    variant='contained'
                    startIcon={<GroupAdd/>}
                    loading={state.creating}
                    disabled={state.nextDisabled}
                    onClick={createSpace}
                >
                    Create {project ? 'Project' : 'Group'}
                </Button>
            }
            contentProps={{
                style: {width: 600, height: 500}
            }}
            leftActionItems={
                <div>
                    <Typography>
                        {hint}
                    </Typography>
                </div>
            }
            nextDisabled={state.nextDisabled && !(state.pageIndex === 0 && project)}
            onPageChange={onPageChange}
        />
    )
}
