import React, { useRef } from 'react'
import Button from '../Shared/Button'
import ViewSelect from '../Space/ViewSelect';
import { IconButton, Tooltip } from '@material-ui/core';
import { ChevronLeft, ChevronRight, Search, Settings } from '@material-ui/icons'
import Dialog from '../Shared/Dialog';
import Calendar, { CalendarApi } from '../DatabaseViews/Calendar';
import { borderStyle } from '../DatabaseViews/borderStyle';
import FullscreenButton from '../Shared/FullscreenButton';
import { getDateString, getMonthString } from '../../utils/dateutils';
import Typography from '../Shared/Typography';
import { EventClickArg } from '@fullcalendar/react';

const calendarViews = [
    'Day',
    'Week',
    'Month',
]

const defaultView = 'month'

interface EventsCalendarProps {
    view: "day" | "week" | "month",
    changeView?: (view: string | undefined) => void,
    expanded?: boolean,
    expandView?: () => void,
    eventSources: any[],
    editable?: boolean,
}

interface EventsCalendarState {
    calendarApi?: CalendarApi | null,
}

export default function EventsCalendar({changeView, view, editable, eventSources, expanded, expandView}: EventsCalendarProps) {
    if (!view) {
        view = defaultView
    }

    const [state, setState] = React.useState<EventsCalendarState>({
    })

    const [title, setTitle] = React.useState('')

    const calendarApi: CalendarApi = state.calendarApi!!;

    const views = calendarViews.map(v => ({title: v, default: defaultView === v, value: v.toLowerCase()}))   

    const moreLinkClick = () => {

    }

    const eventClick = ({event}: EventClickArg) => {
        
    }

    
    const onRangeChange = (start: Date, end: Date) => {
        let title = ''
        if (view === 'month') {
            title = `${getMonthString(start.getMonth() + 1)} ${start.getFullYear()}`
        } else if (view === 'week') {
            const curr = new Date
            const first = curr.getDate() - curr.getDay()
            const last = first + 6

            const firstday = new Date(curr.setDate(first))
            const lastday = new Date(curr.setDate(last))

            if (firstday.getMonth() === lastday.getMonth()) {
                title = `${getMonthString(firstday.getMonth())} ${lastday.getFullYear()}`
            } else if (firstday.getFullYear() === lastday.getFullYear()) {
                title = `${getMonthString(firstday.getMonth()).substring(0, 3)} - ${getMonthString(lastday.getMonth()).substring(0, 3)} ${lastday.getFullYear()}`
            } else {
                title = `${getMonthString(firstday.getMonth()).substring(0, 3)} ${firstday.getFullYear()} - ${getMonthString(lastday.getMonth()).substring(0, 3)} ${lastday.getFullYear()}`
            }
        } else {
            title = getDateString(start)
        }

        setTitle(title)
    }

    const toolbarLeftItems = [
        {
            name: 'Today',
            component: <Button variant='outlined' onClick={calendarApi?.today}>Today</Button>
        },
        {
            name: 'Previous',
            component: <IconButton onClick={calendarApi?.prev}><ChevronLeft/></IconButton>
        },
        {
            name: 'Next',
            component: <IconButton onClick={calendarApi?.next}><ChevronRight/></IconButton>
        }
    ]

    const toolbarRightItems = [
        {
            name: 'Search Events',
            component: <IconButton><Search/></IconButton>
        },
        {
            name: 'Settings',
            component: <IconButton><Settings/></IconButton>
        },
        {
            name: 'Expand',
            component: <FullscreenButton expanded={expanded} onClick={expandView}/>
        },
       
    ]

    if (changeView && expanded) {
        toolbarRightItems.push(
            {
                name: 'Select View',
                component: <ViewSelect views={views} view={view} changeView={(view) => view === defaultView ? changeView(undefined) : changeView(view)}/>
            }
        )
    }

    const calendar = (
        <div style={{height: "100%"}}>
            <div style={{height: 55}}>
                <div style={{float: 'left', display: 'flex', alignItems: 'center'}}>
                    {
                        toolbarLeftItems.map(({name, component}) => (
                            <span 
                                style={{marginLeft: 10}}
                            >
                                <Tooltip
                                    title={name}
                                >
                                    <span>
                                    {component}
                                    </span>
                                </Tooltip>
                            </span>
                        
                        ))
                    }
                    <Typography style={{marginLeft: 15}}>
                        {title}
                    </Typography>
                </div>
                <div style={{float: 'right', display: 'flex', alignItems: 'center', marginRight: 10}}>
                    {
                        toolbarRightItems.map(({name, component}) => (
                            <span 
                                style={{marginLeft: 10}}
                            >
                                <Tooltip
                                    title={name}
                                >
                                    <span>
                                    {component}
                                    </span>
                                </Tooltip>
                            </span>
                        ))
                    }
                </div>
            </div>
            <div style={{display: 'flex', height: '100%', borderTop: 'solid', ...borderStyle}}>
                {
                    /*
                    <div style={{height: '100%', ...borderStyle, borderRight: 'solid', marginTop: 10, marginLeft: 10}}>
                        <EventCalendarsSidebar

                        />
                    </div>
                    */
                }
                
                <div style={{width: '100%', height: '100%'}}>
                    <Calendar
                        view={view}
                        onRangeChange={onRangeChange}
                        moreLinkClick={moreLinkClick}
                        eventClick={eventClick}
                        getCalendarApi={(calendarApi) => setState({...state, calendarApi})}
                        eventSources={eventSources}
                        editable={editable}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <div style={{height: '100%'}}>
            <div style={{height: '100%'}}>
                {calendar}
            </div>
            <Dialog
                fullScreen
                onClose={expandView}
                open={!!expanded}
                disableCloseButton
            >
                {calendar}
            </Dialog>
        </div>
    )
}
