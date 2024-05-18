import React, { useState } from 'react';
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import CompleteButton from '../Task/CompleteButton';
import { getEventDateString } from '../../utils/dateutils';
import { ExpandLess, ExpandMore, People, PriorityHigh, Schedule } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import UserStack from '../User/UserStack';
import { translatePriorityNum } from '../../utils/taskutils';
import Button from '../Shared/Button';
import { Collapse } from '@material-ui/core';
import SubtaskFeature from './SubtaskFeature';

interface TaskFeatureProps {
    post: any,
    connectionIds?: string[],
    hideSubtasks?: boolean
}

export default function TaskFeature({post, connectionIds, hideSubtasks}: TaskFeatureProps) {
    const {completed, priority, dueDate, assignees, ...data} = useFragment(
        graphql`
            fragment TaskFeatureFragment on Post {
                dueDate
                priority
                completed
                assignees: users(userTypes: ["Assignee"], first: 10) {
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserStackFragment
                }
                ...CompleteButtonFragment
                ...SubtaskFeatureFragment
            }
        `,
        post
    )
    const [state, setState] = useState({
        showSubtasks: false
    })
    const dateString = getEventDateString(dueDate)

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'start', width: '100%'}}>
                <div style={{width: '100%', marginRight: 15}}>
                    {
                        dueDate && 
                        <div style={{display: 'flex', alignItems: 'center', marginBottom: 15}}>
                            <Schedule style={{marginRight: 10}}/>
                            <Typography>
                                {dateString}
                            </Typography>
                        </div>
                    }
                    {
                        priority !== null && priority >= 0 && 
                        <div style={{display: 'flex', alignItems: 'center', marginBottom: 15}}>
                            <PriorityHigh style={{marginRight: 10}}/>
                            <Typography>
                                {translatePriorityNum(priority)}
                            </Typography>
                        </div>
                    }
                    {
                        assignees?.edges?.length > 0 && 
                        <div style={{display: 'flex', alignItems: 'center', marginBottom: 15}}>
                            <People style={{marginRight: 10}}/>
                            <UserStack users={assignees} type="Attendee" showName/>
                        </div>
                    }
                </div>
                <div>
                    <CompleteButton
                        post={data}
                    />
                </div>
            </div>
            <Collapse
                in={state.showSubtasks}
                mountOnEnter
            >
                <SubtaskFeature
                    data={data}
                />
            </Collapse>
            <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                {
                    !hideSubtasks && 
                    <Button
                        startIcon={state.showSubtasks ? <ExpandLess/> : <ExpandMore/>}
                        onClick={() => setState({...state, showSubtasks: !state.showSubtasks})}
                    >
                        Subtasks
                    </Button>
                }
            </div>
        </div>
    )
}
