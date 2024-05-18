import React, {Component} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {connect} from 'react-redux';
import './Calendar.css'
import {space} from '../../types/space'
import {post} from '../../types/post'

function renderEventContent(eventInfo) {
    return (
        <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        </>
    )
}

interface CalendarProps{
    
}

class Calendar extends Component<CalendarProps>{
    constructor(props) {
        super(props);
        this.originalNewPost = {
            title: '',
            body: '',
            spaces: [{...this.props.parent, parent_post: this.props.post}],
            type: 'Event',
            info: {},
            users: [],
            start_date: new Date(),
            end_date: null,
            hidden: true,
        };
        this.state = {
            open: false,
            newPost: this.originalNewPost,
            notifications: {},
        }
        this.imageMap = new Map();
        this.postMap = new Map();
        this.handleWeekendsToggle = () => {
            this.setState({
                weekendsVisible: !this.state.weekendsVisible
            })
        }
    
        this.handleDrag = (drag) => {
            const range = drag.event._instance.range;
            this.props.updateEvent({...this.postMap.get(parseInt(drag.event.id.toString())), start_date: range.start, end_date: range.end});
        }
    }

    render() {
        this.postMap.clear();
        const events = this.props.events.map((p) => {
            this.postMap.set(p.post_id, p);
            return {
                id: p.post_id,
                title: p.title,
                start: new Date(p.start_date),
                end: p.end_date ? new Date(p.end_date) : null,
                post: p
            }
        });
        return (
            <div style={{height: '100vh', marginTop: 15, width: '100%'}}>
                {
                    !this.state.loading && 
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        initialView='dayGridMonth'
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={this.state.weekendsVisible}
                        events={events} 
                        select={this.props.beginCreation}
                        eventContent={renderEventContent} 
                        eventClick={this.props.viewEvent}
                        eventChange={this.handleDrag}
                        buttonText={{
                            today:    'TODAY',
                            month:    'MONTH',
                            week:     'WEEK',
                            day:      'DAY',
                            list:     'LIST'
                        }}
                        eventAllow={(dropLocation, draggedEvent) => {
                            const post = this.postMap.get(parseInt(draggedEvent.id.toString()));
                            return (!post || (this.props.currUser && post.post_owner_id === this.props.currUser.user_id));
                        }}
                    />
                }
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return state.orgActions;
}
  
const mapDispatchToProps = {
}
export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
