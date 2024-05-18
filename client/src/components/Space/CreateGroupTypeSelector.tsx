import { DoneAll, Group, QuestionAnswer, School } from '@material-ui/icons'
import React from 'react'
import { space } from '../../types/space'
import ConfigOption from '../Shared/ConfigOption'
import { SpaceCreatorPage } from './SpaceCreator'


/**
 * Message
 * Learning
 * Q & A
 * Action
 */



 const projectTypes = [
    {
        title: 'General',
        description: 'All the basic features.',
        icon: <Group/>
    },
    {
        title: 'Learning',
        description: 'Learning Management System for classes or training.',
        icon: <School/>
    },
    {
        title: 'Q & A',
        description: 'Ask and answer questions.',
        icon: <QuestionAnswer/>
    },
    {
        title: 'Action',
        description: 'Aggregate and manage tasks across multiple projects.',
        icon: <DoneAll/>
    },
]

interface CreateGroupTypeSelector {
    onChange: (space: Partial<space>) => void,
    space: Partial<space>,
}

export default function CreateGroupTypeSelector({onChange, space}: SpaceCreatorPage & CreateGroupTypeSelector) {
    return (
        <div>
            {
                projectTypes.map(({title, ...pt}) => (
                    <ConfigOption
                        title={title}
                        {...pt}
                        onClick={() => onChange({...space, groupType: title})}
                        checked={space.groupType === title}
                        style={{marginTop: 10}}
                    />
                ))
            }
        </div>
    )
}
