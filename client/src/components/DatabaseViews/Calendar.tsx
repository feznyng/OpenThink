import React, { forwardRef, Ref, useImperativeHandle, useRef } from 'react'
import { DatabaseViewProps } from '../../types/database'
import FullCalendar, { AllDayContentArg, DatesSetArg, DayCellContentArg, DayCellContentProps, DayHeader, DayHeaderContentArg, EventClickArg, MoreLinkArg, MoreLinkContentArg } from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import scrollGridPlugin from '@fullcalendar/scrollgrid'
import interactionPlugin from '@fullcalendar/interaction'
import './Calendar.css'
import Typography from '../Shared/Typography'
import { ListItem, ListItemText } from '@material-ui/core'
import Button from '../Shared/Button'
import listPlugin from '@fullcalendar/list';
/**
 * TODO:
 * - Pass events down with correct format and props interface
 * - Pass event selects up 
 * - Pass selectable and editable down
 * - Improve daygrid and weekgrid views https://fullcalendar.io/docs/slot-render-hooks
 * - Improve now indicator https://fullcalendar.io/docs/now-indicator
 * - Test multi-day events
 * - Pass current month up
 */
const dayCellContent = ({date, isToday}: DayCellContentArg) => {
    const day = date.getDate()
    return (
        <Button
            size="small"
            variant={isToday ? "contained" : 'text'}
            color={isToday ? 'primary' : 'default'}
            style={{maxWidth: 25, maxHeight: 25, minWidth: 25, minHeight: 25, marginTop: 5}}
        >
            {day}
        </Button>
    )
}

const dayHeaderContent = ({date}: DayHeaderContentArg) => {
    const dateString = date.toString();
    const day = dateString.substring(0, 3)
    
    return (
        <Typography variant="caption">{day}</Typography>
    )
}

const moreLinkContent = ({num, ...props}: MoreLinkContentArg) => {
    return (
        <ListItem
            button
            style={{padding: 0}}
        >
            
            <ListItemText
                primary={`${num} more`}
                primaryTypographyProps={{variant: 'caption'}}
            />
        </ListItem>
    )
}

const allDayContent = (props: AllDayContentArg) => {
    return (
        <div/>
    )
}

export interface CalendarApi {
    next: () => void,
    prev: () => void,
    today: () => void,
}
interface CalendarProps {
    view: 'day' | 'week' | 'month',
    eventSources: EventSource[],
    editable?: boolean,
    eventClick: (event: EventClickArg) => void,
    moreLinkClick: (event: MoreLinkArg) => void,
    getCalendarApi?: (api: CalendarApi) => void,
    onRangeChange?: (start: Date, end: Date) => void
}

export default function Calendar({view, eventClick, moreLinkClick, getCalendarApi, onRangeChange, editable, eventSources, ...props}: CalendarProps, ref: any) {

    let calendarRef = useRef(null);
    const calendarApi = (calendarRef.current as any)?.getApi();


    let currView = 'dayGridMonth'
    switch (view) {
        case 'day':
            currView = 'timeGridDay'
            break;
        case 'week':
            currView = 'timeGridWeek'
            break;
        case 'month':
            currView = 'dayGridMonth'
            break;
    }
    React.useEffect(() => {
        calendarApi?.changeView(currView)
    }, [view])

    const next = () => calendarApi?.next()
    const prev = () => calendarApi?.prev()
    const today = () => calendarApi?.today()

    React.useEffect(() => {
        getCalendarApi && getCalendarApi({next, prev, today})
    }, [calendarApi])

    const onDatesSet = ({view, start, end}: DatesSetArg) => {
        onRangeChange && onRangeChange(start, end)
    }

    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin ] as any}
            initialView={currView}
            headerToolbar={false}
            dayCellContent={dayCellContent}
            dayHeaderContent={dayHeaderContent}
            moreLinkContent={moreLinkContent}
            moreLinkClick={moreLinkClick}
            eventClick={eventClick}
            allDayContent={allDayContent}
            slotDuration={'01:00:00'}
            nowIndicator
            editable={editable}
            selectable={editable}
            dayMaxEventRows
            datesSet={onDatesSet}
            navLinks
            navLinkDayClick="timeGridDay"
            navLinkWeekClick="timeGridWeek"
            expandRows
            eventSources={eventSources}
        />
    )
}