import React from 'react'
import { 
    Select, MenuItem, FormControl, InputLabel, OutlinedInput, Typography,
} from '@material-ui/core';
import PeopleAutocomplete from '../../../PeopleAutocomplete/PeopleAutocomplete';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import PriorityIcon from '../../../Shared/PriorityIcon';
import {ArrowUpward, CalendarToday, GroupAdd} from '@material-ui/icons'
export default function ActionPostOptions(props) {
    return (
        <div>

            <span style={{marginTop: 15, display: 'flex', alignItems: 'center'}}>
                <span  style={{width: 30, marginRight: 12, display: 'flex', justifyContent: 'center'}}>
                <GroupAdd/>
                </span> 
                <PeopleAutocomplete 
                defaultValue={props.newPost.users ? props.newPost.users.filter(u => u.type === 'Assignee') : []} 
                onChange={(people) => props.onPostChange({...props.newPost, users: people.map(p => {return {...p, type: "Assignee"}})})} 
                parent={props.parent} 
                people={props.parent.users} 
                name="Assignees"
                autoFocus
                />
            </span>

            <div style={{marginTop: 15, display: 'flex', alignItems: 'center'}}>
                <span  style={{width: 30, marginRight: 12, display: 'flex', justifyContent: 'center'}}>
                <CalendarToday/>
                </span>
                <span>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                            placeholder="Due Date"
                            inputVariant="outlined"
                            defaultValue={null}
                            size="small"
                            value={props.newPost.due_date}
                            onChange={(e) => props.onPostChange({
                                    ...props.newPost,
                                    due_date: e
                                }
                            )}
                        />
                    </MuiPickersUtilsProvider>
                    
                </span>
            </div>

            <div style={{marginTop: 15, display: 'flex', alignItems: 'center'}}>
                <span  style={{width: 30, marginRight: 12, display: 'flex', justifyContent: 'center'}}>
                <ArrowUpward/>
                </span>
                <span style={{display: 'flex'}}>
                <FormControl variant="outlined" size="small" placeholder="Priority">
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        defaultValue={1}
                        value={props.newPost.priority}
                        onChange={(e) => props.onPostChange({...props.newPost, priority: e.target.value})}
                        >   
                            <MenuItem value={0}>
                                <span style={{display: 'flex'}}>
                                <PriorityIcon level={0}/> <Typography>None</Typography>
                                </span>
                                
                            </MenuItem>
                            <MenuItem value={1}>
                                <span style={{display: 'flex'}}>
                                <PriorityIcon level={1}/> <Typography>Low</Typography>
                                </span>
                                
                            </MenuItem>
                            <MenuItem value={2}>
                                <span style={{display: 'flex'}}>
                                <PriorityIcon level={2}/> <Typography>Medium</Typography>
                                </span>
                            </MenuItem>
                            <MenuItem value={3}>
                                <span style={{display: 'flex'}}>
                                <PriorityIcon level={3}/> <Typography>High</Typography>
                                </span>
                            </MenuItem>
                        </Select>
                    </FormControl>
                </span>
            </div>

        </div>
    )
}
