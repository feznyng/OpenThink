import { LocationOn, PersonAdd } from '@material-ui/icons'
import React from 'react'
import { user } from '../../types/user'
import LocationSearchInput, { Location } from '../Shared/LocationSearchInput'
import UserSelector from '../Shared/UserSelector'

interface LocationAttributeEditorProps {
    location: Location
    onChange: (location: Location) => void,
    placeholder: string
}

export default function LocationAttributeEditor({location, placeholder, onChange}: LocationAttributeEditorProps) {
    return (
        <span style={{display: 'flex', alignItems: 'center'}}>
            <LocationOn style={{marginRight: 10}}/>
            <LocationSearchInput
                value={location}
                onLocationChange={onChange}
                onAddressChange={address => onChange({...location, address})}
                size="small"
                fullWidth
            />
        </span>
    )
}
