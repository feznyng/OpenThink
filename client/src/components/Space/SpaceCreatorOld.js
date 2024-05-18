import React, { Component } from 'react';
import {createSpace} from '../../actions/orgActions';
import { TextField, FormControl, InputLabel, OutlinedInput, Button, Typography, Collapse, DialogActions, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import {Public, Visibility, VisibilityOff, Add, Close, ExpandMore, ExpandLess, LockOpen, Lock} from '@material-ui/icons';
import {connect} from "react-redux";
import Tags from '../Shared/Tags/Tags';
import {createNotification} from '../../actions/notificationActions';
import store from '../../Store';
import LocationSearchInput from '../Shared/LocationSearchInputOld';
import SpaceAutocomplete from './SpaceAutocomplete';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import TagSelector from '../Shared/Tags/TagSelector';
import TopicEditor from '../Shared/TopicEditor';

class OrganizationCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            description: '',
            type: 'Public',
            access_type: 'Open',
            space_type: 'Wiki',
            parent_space_id: this.props.parent ? this.props.parent.space_id : null,
            tags: this.props.parent ? this.props.parent.tags : [],
            project: this.props.project,
            spaces: this.props.project ? [{space_id: this.props.parent.space_id, name: this.props.parent.name}] : null,
            start_date: null,
            end_date: null,
            expandedOptions: false, 
            topics: (this.props.parent && this.props.parent.topics) ? this.props.parent.topics : [],
        }
        this.createSpace = () => {
            if (this.state.name === '' || this.state.topics.length < 1) {
                return;
            }
            this.props.createSpace(this.state, !(!!this.props.parent)).then((e) => {

                if (this.props.parent) {
                    const user = this.props.parent.users.find(u => u.user_id === store.getState().userActions.userInfo.user_id)

                    this.props.parent.users.forEach(u => {
                        if (u.info && u.info.subspaces && (!user || u.user_id !== user.user_id)) {
                            createNotification(u.user_id, {
                                type: 'newSubspace',
                                read: false,
                                user_id: u.user_id,
                                project: this.props.parent.project_id ? true : false,
                                space_id: this.props.parent.space_id,
                                space2_id: e.space_id,
                            });
                        }
                    });
                }
                console.log(e)
                this.props.onFinish(e);
            });


        }
    }


    render() {
        return (
            <div>
                <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <FormControl  style={{marginLeft: '5px', marginRight: '5px'}}>
                            <Select
                                value={this.state.type}
                                onChange={(e) => this.setState({...this.state, type: e.target.value})}
                            >
                                <MenuItem value={'Public'}><Public style={{marginRight: '5px'}}/>Public</MenuItem>
                                <MenuItem value={'Private'}><VisibilityOff style={{marginRight: '5px'}}/>Private</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl  style={{marginLeft: '5px'}}>
                            <Select
                                value={this.state.access_type}
                                onChange={(e) => this.setState({...this.state, access_type: e.target.value})}
                            >
                                <MenuItem value={'Open'}><LockOpen style={{marginRight: '5px'}}/>Open</MenuItem>
                                <MenuItem value={'Closed'}><Lock style={{marginRight: '5px'}}/>Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    
                   
                    <FormControl variant="outlined" style={{marginTop:'20px', width: '100%'}}>
                        <InputLabel htmlFor="outlined-adornment-password">Name</InputLabel>
                        <OutlinedInput
                            type='text'
                            value={this.state.name}
                            onChange={e =>  this.setState({
                                ...this.state,
                                name: e.target.value,
                            })}
                            label="Name"
                        />
                    </FormControl>

                    <TextField
                        label="Description"
                        multiline
                        rows={5}
                        value={this.state.description}
                        onChange={e => this.setState({...this.state, description: e.target.value})}
                        variant="outlined"
                        style={{width: '100%', marginTop: 20}}
                    />
                </div>
                <div style={{marginTop: 20}}>
                    <LocationSearchInput 
                        style={{width: '100%'}} 
                        defaultValue={this.state.address}
                        onChange={(location) => {
                        this.setState({
                            ...this.state,
                            address: location.address,
                            longitude: location.longitude,
                            latitude: location.latitude,
                        })}}
                    />
                </div>
                <div style={{marginTop: 20}}>
                    {
                        this.state.tags.length < 1 &&
                        <Typography style={{marginBottom: 20}}>
                            Please add at least one category or cause. These allow aligned organizations and people to find your group.
                        </Typography>
                    }
                    <div>
                        <TopicEditor
                            selectedTopics={this.state.topics}
                            onChange={topics => this.setState({...this.state, topics})}
                            type="Topic"
                        />
                    </div>
                </div>
                    {
                        this.props.project &&
                        <div>

                        
                        <Collapse  style={{marginTop: 10}} in={this.state.expandedOptions} mountOnEnter unmountOnExit>                       
                            <div>
                            
                                <div>
                                    <div style={{marginTop: 20}}>
                                        <SpaceAutocomplete
                                            defaultValue={[this.state.spaces[0]]} 
                                            onChange={(spaces) => {this.setState({...this.state, spaces})}}
                                            inGroup
                                        />
                                    </div>
                                    <div style={{marginTop: 20}}>
                                    <span style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <DateTimePicker
                                                placeholder="Start Date"
                                                inputVariant="outlined"
                                                defaultValue={null}
                                                fullWidth
                                                size="small"
                                                value={this.state.start_date}
                                                onChange={(e) => 
                                                    this.setState({
                                                        ...this.state,
                                                        start_date: e
                                                    })
                                                }
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
                                                value={this.state.end_date}
                                                onChange={(e) => 
                                                    this.setState({
                                                        ...this.state,
                                                        end_date: e
                                                    })
                                                }
                                                
                                            />
                                        </MuiPickersUtilsProvider>
                                    </span> 
                                
                                    </div>
                                </div>
                                
                            
                            </div>
                        </Collapse>
                            <div style={{display: 'flex', width: '100%', justifyContent: 'center', marginTop: 10}}>
                                <Button onClick={() => {this.setState({...this.state, expandedOptions: !this.state.expandedOptions})}} style={{width: '100%'}}>
                                    {this.state.expandedOptions ? <React.Fragment><ExpandLess/> Less Options</React.Fragment> : <React.Fragment><ExpandMore/> More Options</React.Fragment>}
                                </Button>
                            </div>
                        </div>
                    }
                <div style={{float: 'right', marginTop: 20}}>
                    <Button variant="contained" color="primary" disabled={this.state.name === '' || this.state.topics.length < 1} onClick={this.createSpace}><Add/> Create {this.props.project ? 'Project' : 'Group'}</Button>
                </div>
                  
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return state.orgActions;
  }
  
  const mapDispatchToProps = {
    createSpace
  }


const Creator = connect(mapStateToProps, mapDispatchToProps)(OrganizationCreator)

export default class HOC extends Component{
    render() {
        return (
            <Creator {...this.props}/>
        )
    }
}