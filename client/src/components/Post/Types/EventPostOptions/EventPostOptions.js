import React from 'react'
import PeopleAutocomplete from '../../../PeopleAutocomplete/PeopleAutocomplete';
import DateFnsUtils from '@date-io/date-fns';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import LocationSearchInput from '../../../Shared/LocationSearchInputOld';
import { Typography } from '@material-ui/core';
import {AddLocation, CalendarToday, GroupAdd, People} from '@material-ui/icons'
export default function EventPostOptions(props) {
    return (
        <div>
            <span style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                <span  style={{marginRight: 12, width: 30, display: 'flex', justifyContent: 'center'}}>
                    <CalendarToday style={{marginLeft: 4}}/>
                </span>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker
                        placeholder="Start Date"
                        inputVariant="outlined"
                        defaultValue={null}
                        fullWidth
                        size="small"
                        value={props.newPost.start_date}
                        onChange={(e) => props.onPostChange({
                                ...props.newPost,
                                start_date: e,
                                end_date: (new Date(e)).setHours(e.getHours() + 1),
                            }
                        )}
                    />
                </MuiPickersUtilsProvider>
                <Typography style={{marginLeft: 10, marginRight: 10}}> - </Typography>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker
                        placeholder="End Date"
                        inputVariant="outlined"
                        fullWidth
                        size="small"
                        defaultValue={null}
                        value={props.newPost.end_date}
                        onChange={(e) => props.onPostChange({
                                ...props.newPost,
                                end_date: e
                            }
                        )}
                        
                    />
                </MuiPickersUtilsProvider>
            </span> 
        
        
            <span style={{marginTop: 15, display: 'flex', alignItems: 'center'}}>
                <span  style={{width: 30, marginRight: 12, display: 'flex', justifyContent: 'center'}}>
                <GroupAdd/>
                </span>
                <PeopleAutocomplete 
                    defaultValue={props.newPost.users ? props.newPost.users.filter(u => u.type === 'Invite') : []} 
                    onChange={(people) => props.onPostChange({...props.newPost, users: people.map(p => {return {...p, type: "Invite"}})})} 
                    parent={props.parent} 
                    people={props.parent.users} 
                    autoFocus
                    name="Invitees"
                />
            </span>
            
            <div style={{marginTop: 15, display: 'flex', alignItems: 'center'}}>
                <span  style={{marginRight: 10, width: 30, display: 'flex', justifyContent: 'center'}}>
                    <AddLocation/>
                </span>
                <div style={{width: '100%'}}>
                <LocationSearchInput 
                    defaultValue={props.newPost.address}
                    autoFocus
                    onChange={(location) => 
                    props.onPostChange({
                            ...props.newPost, 
                            address: location.address,
                            longitude: location.longitude,
                            latitude: location.latitude,
                        }
                    )}
                />
                </div>
                
            </div>
            
    </div>
    )
}
