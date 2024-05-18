import React, {Component} from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {DialogContent, DialogActions, Button, CircularProgress, Dialog} from '@material-ui/core';
import {getParentPosts} from '../../actions/orgActions';
import PostEditor from '../Post/Editor/PostEditor';
import {createPost} from '../Post/PostCreatorOld'
import './TaskCalendar.css'
export default function TaskCalendar() {
    return (
        <div>
            Task Calendar
        </div>
    )
}


/*
function renderEventContent(eventInfo) {
    return (
        <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        </>
    )
}

class Calendar extends Component {
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
            end_date: null
        };
        this.state = {
            open: false,
            newPost: this.originalNewPost,
            notifications: {},
        }
        this.postMap = new Map();
        this.getParentPosts = () => {
            this.setState({
                ...this.state,
                loading: true
            }, () => {
                const events = this.props.tasks.filter(p => p.type === 'Action Item' && !p.original_deleted && !p.deleted).map(p => {
                    this.postMap.set(p.post_id, p);
                    return {
                        id: p.post_id,
                        title: p.title,
                        start: new Date(p.due_date),
                        end: p.end_date ? new Date(p.due_date) : null,
                        post: p
                    }
                });
                this.setState({
                        ...this.state,
                        weekendsVisible: true,
                        events,
                        loading: false
                })
            })
        }
    
        this.handleDateSelect = (selectInfo) => {
            if (!this.props.currUser) {
                return;
            }
            this.setState({
                ...this.state,
                open: true, 
                newPost: {
                    ...this.state.newPost,
                    start_date: new Date(),
                    start_date: selectInfo.start,
                    end_date: selectInfo.end
                },
            })
        }
    
        this.handleDrag = (drag) => {
            const range = drag.event._instance.range;
            this.props.updatePost({...this.postMap.get(parseInt(drag.event.id.toString())), due_date: range.start,});
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tasks !== this.props.tasks) {
            
            this.getParentPosts();
            
        }
    }

    componentDidMount() {
        this.getParentPosts();
    }

    render() {
        return (
            <div style={{height: '100vh'}}>
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
                        events={this.state.events} 
                        select={(selectInfo) => {
                            if (!this.props.currUser) {
                                return;
                            }
                            this.props.onCreate(null, {due_date: selectInfo.start,})
                        }}
                        eventContent={renderEventContent} 
                        eventClick={(clickInfo) => this.props.onClick({
                            post_id: clickInfo.event._def.publicId
                        })}
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
    return {};
}
  
const mapDispatchToProps = {
    updatePost
}
export default connect(mapStateToProps, mapDispatchToProps)(Calendar)


*/
