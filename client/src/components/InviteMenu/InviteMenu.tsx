import { Divider } from '@material-ui/core'
import React, { Suspense } from 'react'
import GeneralTabs from '../Shared/GeneralTabs'
import InviteConnections from './InviteConnections'
import InviteEveryone from './InviteEveryone'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import InviteSpaceMembers from './InviteSpaceMembers'
import InviteGroups from './InviteGroups'
import InviteRoles from './InviteRoles'
import { toggleArrayElement } from '../../utils/arrayutils'
import SpaceInviteLink from './SpaceInviteLink'


interface InviteMenuProps{
    space: any,
    user: any,
    userIds?: number[],
    roleIds?: number[],
    groupIds?: number[],
    onUsersChange?: (userIds: number[]) => void,
    onRolesChange?: (roleIds: number[]) => void,
    onGroupsChange?: (groupIds: number[]) => void,
    excludeOptions?: string[],
    spaceMemberProps?: {
        toggleAll?: () => void,
        allSpaceMembers?: boolean
    }
    
}

export default function InviteMenu({space, user, userIds, roleIds, groupIds, spaceMemberProps, excludeOptions, onUsersChange, onRolesChange, onGroupsChange}: InviteMenuProps) {
    const spaceData = useFragment(
        graphql`
            fragment InviteMenuFragment_space on Space {
                spaceId
                ...InviteConnectionsFragment_space
                ...InviteEveryoneFragment_space
                ...InviteSpaceMembersFragment
                ...SpaceInviteLinkFragment
            }
        `,
        space ? space : null
    )

    const userData = useFragment(
        graphql`
            fragment InviteMenuFragment_user on User {
                ...InviteConnectionsFragment_user
                ...InviteEveryoneFragment_user
                ...InviteGroupsFragment_user
            }
        `,
        user ? user : null
    )


    const selectUser = (userId: number) => {
        onUsersChange && onUsersChange(toggleArrayElement(userId, userIds!!))
    }

    const selectGroup = (groupId: number) => {
        onGroupsChange && onGroupsChange(toggleArrayElement(groupId, groupIds!!))
    }

    const selectRole = (roleId: number) => {
        onRolesChange && onRolesChange(toggleArrayElement(roleId, roleIds!!))
    }

    let tabs = [
        /*
        {
            title: 'Email',
            value: 'email',
            Page: InviteEmail
        }
        */
    ]

    if (userIds && selectUser) {
        tabs.push(
            {
                title: `People`,
                value: 'people',
                page: (
                    <InviteEveryone
                        space={spaceData}
                        user={userData}
                        onUserSelect={selectUser}
                        userIds={userIds}
                    />
                )
            },
            /*
            {
                title: 'Connections',
                value: 'connections',
                page: (
                    <InviteConnections
                        space={spaceData}
                        user={userData}
                        onUserSelect={selectUser}
                        userIds={userIds}
                    />
                )
            },
            */
            {
                title: 'Members',
                value: 'members',
                page: (
                    <InviteSpaceMembers
                        space={spaceData}
                        onUserSelect={selectUser}
                        userIds={userIds}
                        {...spaceMemberProps}
                    />
                )
            },
        )
    }

    if (groupIds) {
        tabs.push(
            {
                title: 'Groups',
                value: 'groups',
                page: (
                    <InviteGroups
                        space={spaceData}
                        user={userData}
                        onGroupSelect={selectGroup}
                        groupIds={groupIds}
                    />
                )
            },
        )
    }

    if (roleIds && selectRole) {
        tabs.push(
            {
                title: 'Roles',
                value: 'roles',
                page: (
                    <InviteRoles
                        space={spaceData}
                        onRoleSelect={selectRole}
                        roleIds={roleIds}
                    />
                )
            },
        )
    }
    
    tabs = tabs.filter(t => !excludeOptions?.includes(t.value))
    
    const [state, setState] = React.useState({
        currPage: tabs[0].value
    })


    return (
        <React.Fragment>
            <div>
                <div>
                    {
                        tabs.length > 1 && 
                        <React.Fragment>
                            <GeneralTabs
                                tabs={tabs}
                                onClick={(currPage) => setState({...state, currPage})}
                                selected={state.currPage}
                                tabProps={{
                                    variant: "small"
                                }}
                            />
                            <Divider/>
                        </React.Fragment>
                    }
                </div>
                <div
                    style={{marginTop: 10}}
                >
                    <Suspense
                        fallback={<div/>}
                    >
                        {
                            tabs.map(({page, value}) => (
                                <div
                                    style={{display: value === state.currPage ? 'block' : 'none'}}
                                >
                                    {page}
                                </div>
                            ))
                        }
                    </Suspense>
                    <SpaceInviteLink
                        space={spaceData}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}
