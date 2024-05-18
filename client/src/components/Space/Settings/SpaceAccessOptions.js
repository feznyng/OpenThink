import { IconButton, Switch, TextField, Typography } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React from 'react'
import { SpaceOptionButton } from '../SpaceOptionButton'
import MultiTextInput from './MultiTextInput';

export default function SpaceAccessOptions({currAccess, changeOption, toggleQuestions, questionChange, questions, answersRequired, questionContext, questionContextChange}) {

    const types = [
        {
            title: 'Closed',
            desc: 'Members can only join through invites.'
        },
        {
            title: 'Restricted',
            desc: 'Users must apply to join this group.',
        },
        {
            title: 'Open',
            desc: 'Anyone who can see this group can join it.'
        },
    ]

    return (
        <div>
            {
                types.map(t => (
                    <SpaceOptionButton
                        title={t.title}
                        description={t.desc}
                        toggleChecked={() => changeOption(t.title)}
                        checked={currAccess === t.title}
                    >
                        {
                            t.title === 'Restricted' &&
                            <div onClick={(e) => e.stopPropagation()}>
                                <div style={{display: 'flex', alignItems: 'center'}} onClick={() => {toggleQuestions()}}>
                                    <Switch
                                        checked={Boolean(answersRequired)}
                                    /> 
                                    <Typography>Require users to answer questions to join this group when requesting to join.</Typography>
                                </div>
                                <TextField
                                    disabled={!Boolean(answersRequired)}
                                    value={questionContext}
                                    rows={2}
                                    rowsMax={3}
                                    variant="outlined"
                                    label="Invite Message"
                                    multiline
                                    onChange={e => questionContextChange(e.target.value)}
                                    fullWidth
                                    style={{marginTop: 10, marginBottom: 10}}
                                    
                                    placeholder="Add a welcome message for new members"
                                />
                                <MultiTextInput
                                    onChange={questionChange}
                                    values={questions}
                                    disabled={!Boolean(answersRequired)}
                                />
                            </div>
                        }
                    </SpaceOptionButton>
                ))
            }
        </div>
    )
}
