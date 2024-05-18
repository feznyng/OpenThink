import React from 'react'
import { useFragment } from 'react-relay'
import { SpaceCreatorPage } from './SpaceCreator'
import graphql from 'babel-plugin-relay/macro';
import InviteMenu from '../InviteMenu/InviteMenu';

interface CreateSpaceInviteProps {
    space: any,
    user: any
}

export default function CreateSpaceInvite({onChange, space, user, newSpace}: SpaceCreatorPage & CreateSpaceInviteProps) {
    const {spaceId, ...spaceData} = useFragment(
        graphql`
            fragment CreateSpaceInviteFragment_space on Space {
                spaceId
                project
                ...InviteMenuFragment_space
            }   
        `
        ,
        space
    )

    const userData = useFragment(
        graphql`
            fragment CreateSpaceInviteFragment_user on User {
                ...InviteMenuFragment_user
            }   
        `
        ,
        user
    )

    const {invitedUserIds, invitedGroupIds, invitedRoleIds} = newSpace;

    const onUsersChange = (invitedUserIds: number[]) => {
        onChange({
            ...newSpace,
            invitedUserIds
        })
    }

    const onRolesChange = (invitedRoleIds: number[]) => {
        onChange({
            ...newSpace,
            invitedRoleIds
        })
    }

    const onGroupsChange = (invitedGroupIds: number[]) => {
        onChange({
            ...newSpace,
            invitedGroupIds
        })
    }

    const toggleAllSpaceMembers = () => {
        onChange({
            ...newSpace,
            inviteAllSpaceMembers: !newSpace.inviteAllSpaceMembers
        })
    }

    return (
        <div>
            <InviteMenu
                space={spaceData}
                user={userData}
                userIds={invitedUserIds}
                onUsersChange={onUsersChange}
                groupIds={invitedGroupIds}
                onGroupsChange={onGroupsChange}
                // roleIds={invitedRoleIds}
                // onRolesChange={onRolesChange}
                spaceMemberProps={{
                    toggleAll: toggleAllSpaceMembers,
                    allSpaceMembers: newSpace.inviteAllSpaceMembers
                }}
                excludeOptions={newSpace.project ? [] : ['groups']}
            />
        </div>
    )
}
