import { Chip, Typography, TextField, TextFieldProps, OutlinedInputProps } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Done } from '@material-ui/icons';
import React from 'react'
import OutlinedInput from '../Shared/OutlinedInput';
import SkillEditor from '../Shared/SkillEditor';
import TagSelector from '../Shared/Tags/TagSelector';
import TopicEditor from '../Shared/TopicEditor';
import SkillSelector from '../User/SkillSelector';
import CauseSelector from '../Shared/CauseSelector';

export interface AboutUserData {
    selectedInterests: string[],
    selectedSkills: string[]
}

interface AboutUserProps {
    data: AboutUserData
    onChange: (data: AboutUserData) => void
}


const skills = [
    'Programming',
    'Organizing Protests',
    'Leadership',
    'Public Speaking',
    'Video Production',
]

const interests = [
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

export default function AboutUser(props: AboutUserProps) {
    const {data, onChange} = props;
    
    const {
        selectedSkills,
        selectedInterests
    } = data;

    return (
        <div style={{paddingTop: '5vw', overflow: 'hidden', width: '100%'}}>
            <div style={{ maxWidth: 800, width: '100%'}}>
                <Typography variant="h6">
                    What are you interested in working on?
                </Typography>
                <div style={{minHeight: 50, marginTop: 15}}>
                    <CauseSelector
                        value={selectedInterests}
                        onChange={(selectedInterests) => onChange({selectedInterests, selectedSkills})}
                    />
                </div>
            </div>
            <div style={{marginTop: 20, minHeight: 200}}>
                <Typography variant="h6">
                    Do you have any skills you want to share?
                </Typography>
                <div style={{minHeight: 50, marginTop: 15}}>
                    <SkillSelector
                        value={selectedSkills}
                        onChange={(selectedSkills) => onChange({selectedInterests, selectedSkills})}
                    />
                </div>
            </div>
        </div>
    )
}
