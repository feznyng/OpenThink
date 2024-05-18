import { PersonAdd } from '@material-ui/icons'
import React from 'react'
import { user } from '../../types/user'
import UserSelector from '../Shared/UserSelector'

interface UserAttributeEditorProps {
    users: user[],
    onChange: (users: user[]) => void,
    placeholder: string
}

export default function UserAttributeEditor({users, placeholder, onChange}: UserAttributeEditorProps) {
    return (
        <span style={{display: 'flex', alignItems: 'center'}}>
            <PersonAdd style={{marginRight: 10}}/>
            <UserSelector
                value={users}
                size="small"
                onChange={onChange}
                placeholder={placeholder}
            />
        </span>
    )
}
