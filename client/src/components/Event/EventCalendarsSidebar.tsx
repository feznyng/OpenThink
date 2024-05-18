import React from 'react'
import {Checkbox, Grow, ListItem} from '@material-ui/core'
import Typography from '../Shared/Typography'
import DropDownButton from '../Shared/DropDownButton'
import { toggleArrayElement } from '../../utils/arrayutils'
import { Collapse } from 'react-bootstrap'

interface EventCalendarsSidebarProps {
    type?: 'space' | 'user'
}

export default function EventCalendarsSidebar({type}: EventCalendarsSidebarProps) {
    if (!type) {
        type = 'user'
    }

    const calendarGroups = [
        {
            title: 'My Calendars',
            calendars: [
                {
                    title: 'External',
                    color: '#7CB342'
                },
                {
                    title: 'Projects',
                    color: '#4285F4'
                },
                {
                    title: 'Exams',
                    color: '#3F51B5'
                },
                {
                    title: 'Honors Thesis',
                    color: '#9E69AF',
                },
                {
                    title: 'Meetings',
                    color: '#F6BF26'
                }
            ]
        },
        {
            title: 'Group Calendars',
            calendars: [
                {
                    title: 'CEPA',
                    color: '#7CB342'
                },
                {
                    title: 'RJC',
                    color: '#4285F4'
                },
                {
                    title: 'MassPIRG',
                    color: '#3F51B5'
                },
                {
                    title: 'Climate Action Now',
                    color: '#9E69AF',
                },
                {
                    title: 'OpenThink',
                    color: '#F6BF26'
                }
            ]
        }
    ]

    const [state, setState] = React.useState<{collapsedCalendarGroups: string[]}>({
        collapsedCalendarGroups: []
    })


    const toggleCalendarGroup = (groupName: string) => {
        console.log('here')
        setState({
            collapsedCalendarGroups: toggleArrayElement(groupName, state.collapsedCalendarGroups)
        })
    }

    return (
        <div style={{width: 200, height: '100%'}}>
            {
                calendarGroups.map(({title, calendars}) => {
                    const open = !state.collapsedCalendarGroups.find(g => g === title)
                    return (
                        <div style={{marginBottom: 10}}>
                            <ListItem
                                style={{padding: 0}}
                                button
                                onClick={() => toggleCalendarGroup(title)}
                            >
                                <Typography variant='subtitle2'>
                                    {title}
                                </Typography>
                                <DropDownButton
                                    style={{position: 'absolute', right: 5, top: -5}}
                                    open={open}
                                />
                            </ListItem>
                            <Collapse in={open}>
                                <div>
                                    {
                                        calendars.map(({title, color}) => (
                                            <ListItem
                                                button
                                                style={{padding: 0}}
                                            >
                                                <Checkbox style={{color}}/> {title}
                                            </ListItem>
                                        ))
                                    }
                                </div>
                            </Collapse>
                        </div>
                    )
                })
            }
        </div>
    )
}
