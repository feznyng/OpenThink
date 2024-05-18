import { Chip, Typography, TextField, TextFieldProps, OutlinedInputProps } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Done } from '@material-ui/icons';
import React from 'react'
import OutlinedInput from './OutlinedInput';
import TagSelector from './Tags/TagSelector';

const skills = [
    'Programming',
    'Organizing Protests',
    'Leadership',
    'Public Speaking',
    'Video Production',
]


export default function SkillEditor({selectedSkills, onChange}: {selectedSkills: string[], onChange: (val: string[]) => void}) {
    return (
        <div>
            <TagSelector
                selectedTags={selectedSkills}
                onChange={onChange}
                getTags={() => skills}
                suggestions={skills}
                type={"Skill"}
                placeholder="Skill Ex. Data Science"
            />
        </div>
    )
}


