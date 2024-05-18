import { Chip, Typography, TextField, TextFieldProps, OutlinedInputProps } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Done } from '@material-ui/icons';
import React from 'react'
import OutlinedInput from './OutlinedInput';
import TagSelector from './Tags/TagSelector';

const topics = [
    'Racial Justice',
    'Climate Change',
    'Education',
    'Poverty',
    'World Hunger',
    'Restorative Justice',
    'Politics',
    'Sustainability',
    'Human Rights'
]

export default function TopicEditor({selectedTopics, onChange, type}: {selectedTopics: string[], onChange: (val: string[]) => void, type: string}) {
    return (
        <div>
            <TagSelector
                selectedTags={selectedTopics}
                onChange={onChange}
                getTags={() => topics}
                suggestions={topics}
                type={type}
                placeholder={`${type} Ex. Climate Change`}
            />
        </div>
    )
}


