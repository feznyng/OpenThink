import React from 'react'
import CauseSelector from '../Shared/CauseSelector'
import LocationSearchInput from '../Shared/LocationSearchInput'
import TextField, { TextFieldExtendedProps } from '../Shared/TextField'
import SpaceAccessSelect from './SpaceAccessSelect'
import { SpaceCreatorPage } from './SpaceCreator'
import SpaceVisibilitySelect from './SpaceVisibilitySelect'

const commonFieldProps = {
    style: {marginBottom: 20},
    fullWidth: true,
}

export default function CreateSpaceGeneral({newSpace, onChange}: SpaceCreatorPage) {
    return (
        <div>
            <SpaceVisibilitySelect
                {...commonFieldProps}
                handleChange={(type: string) => onChange({...newSpace, type})}
                visibility={newSpace.type as any}
                project={newSpace.project}
                style={{maxHeight: 65, ...commonFieldProps.style}}
            />
            <SpaceAccessSelect
                {...commonFieldProps}
                handleChange={(accessType: string) => onChange({...newSpace, accessType})}
                access={newSpace.accessType as any}
                project={newSpace.project}
                style={{maxHeight: 65, ...commonFieldProps.style}}
            />
            <TextField
                {...commonFieldProps}
                value={newSpace.name}
                onChange={e => onChange({...newSpace, name: e.target.value})}
                placeholder='Name'
                autoFocus
            />
            <TextField
                {...commonFieldProps}
                onChange={e => onChange({...newSpace, description: e.target.value})}
                value={newSpace.description}
                placeholder='Add Description'
                multiline
                rows={3}
            />
            <LocationSearchInput
                {...commonFieldProps}
                onLocationChange={locationInfo => onChange({...newSpace, ...locationInfo})}
                value={newSpace}
            />
            <CauseSelector
                {...commonFieldProps}
                value={newSpace.causes!!}
                onChange={(causes) => onChange({...newSpace, causes})}
            />
        </div>
    )
}
