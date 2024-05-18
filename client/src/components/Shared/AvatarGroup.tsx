import React from 'react'

interface AvatarGroupProps {
    Icon: any,
    avatarList: any[]
}

export default function AvatarGroup({Icon, avatarList}: AvatarGroupProps) {
    return (
        <div style={{display: 'flex', alignItems: 'center', width: 100}}>
            {
                avatarList.map((props) => (
                    <span style={{marginRight: -5, zIndex: 10}}>
                        <Icon
                            {...props}
                        />
                    </span>
                ))
            }
        </div>
    )
}
