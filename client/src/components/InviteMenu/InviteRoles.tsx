import React from 'react'

interface InviteRolesProps {
    space: any,
    roleIds: number[],
    onRoleSelect?: (roleId: number) => void,
}

export default function InviteRoles({}: InviteRolesProps) {
    return (
        <div>
            Invite Roles
        </div>
    )
}
