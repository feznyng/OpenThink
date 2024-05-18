import React, { CSSProperties } from 'react'
import UserAttributeEditor from './UserAttributeEditor'
import DateAttributeEditor from './DateAttributeEditor'
import Select from '../Shared/Select'
import { ListItemIcon, ListItemText } from '@mui/material'
import { FiberManualRecord, ExpandMore, PriorityHigh, ExpandLess } from '@material-ui/icons'
import { Collapse, FormControl, MenuItem } from '@material-ui/core'
import Typography from '../Shared/Typography'
import AttributeIcon from './Attributes/AttributeIcon'
import FormSingleChoice from '../Form/FormChoice'
import TagSelector from '../Tags/TagSelector'
import Button from '../Shared/Button'
import SpaceSelector from '../Space/SpaceSelector'
import { Groups } from '@mui/icons-material'
import LocationAttributeEditor from './LocationAttributeEditor'
/**
* TODO:
* Add a location or virtual location to the event attr editor
*/

const priorities = [
    {
        name: 'High',
        color: 'red',
        value: 2
    },
    {
        name: 'Medium',
        color: 'orange',
        value: 1
    },
    {
        name: 'Low',
        color: 'green',
        value: 0
    }
]

const pollOptions = [
    'Select',
    'Multi-select'
]

export interface PostTypeAttributesEditor {
    post: any,
    onChange: (post: any) => void,
    style?: CSSProperties,
    existing?: boolean,
    defaultExpanded?: boolean
}

export default function PostTypeAttributesEditor({post, existing, defaultExpanded, style, onChange}: PostTypeAttributesEditor) {
    const [state, setState] = React.useState({
        expanded: !!defaultExpanded
    })

    const attributeEditors = [
        {
            type: 'Task',
            attributes: [
                (
                    <DateAttributeEditor
                        startValue={post.dueDate}
                        placeholder="Due Date"
                        onStartDateChange={(dueDate) => onChange({...post, dueDate})}
                    />
                ),
                (
                    <UserAttributeEditor
                        users={post.assignees}
                        onChange={assignees => onChange({...post, assignees})}
                        placeholder={"Assignees"}
                    />
                ),
                (
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <PriorityHigh style={{marginRight: 10}}/>
                        <FormControl style={{width: '100%', padding: 0, height: 40}} size='small' placeholder="Priority">
                            <Select 
                                value={post.priority}
                                style={{height: 40, width: '100%'}}
                                placeholder="Priority"
                                onChange={e => onChange({...post, priority: e.target.value})}
                                renderValue={(selected) => {
                                    const priority = priorities.find(p => p.value === selected)
                                    if (!priority) 
                                        return (
                                            <div style={{width: '100%', display: 'flex', alignItems: 'center', color: '#A1A1A1'}}>
                                                None
                                            </div>
                                        )
                                    const {value, name, color} = priority
                                    return (
                                        <div style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                                            <ListItemIcon>
                                                <FiberManualRecord style={{color}}/>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={name}
                                            />
                                        </div>
                                    )
                                }}
                            >
                                <MenuItem value={-1}>
                                    None
                                </MenuItem>
                                {
                                    priorities.map(({name, value, color}) => (
                                        <MenuItem value={value} placeholder="">
                                            <ListItemIcon>
                                                <FiberManualRecord style={{color}}/>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={name}
                                            />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </div>
                )
            ]
        },
        {
            type: 'Event',
            attributes: [
                (
                    <DateAttributeEditor
                        startValue={post.startDate}
                        endValue={post.endDate}
                        onStartDateChange={(startDate) => onChange({...post, startDate})}
                        onEndDateChange={(endDate) => onChange({...post, endDate})}
                        includeTime
                    />
                ),
                (
                    <LocationAttributeEditor
                        location={{address: post.address, latitude: post.latitude, longitude: post.longitude}}
                        onChange={location => onChange({...post, ...location})}
                        placeholder={"Invitees"}
                    />
                ),
                (
                    <UserAttributeEditor
                        users={post.invitees}
                        onChange={invitees => onChange({...post, invitees})}
                        placeholder={"Invitees"}
                    />
                ),
            ],
        },
        {
            type: 'Poll',
            attributes: [
                <div>
                    <div>
                        {
                            !existing && 
                            <Select 
                                value={post.poll.type}
                                style={{height: 45}}
                                onChange={(e) => onChange({
                                    ...post, 
                                    attributes: [
                                        {
                                            ...post.poll,
                                            type: e.target.value
                                        }
                                    ]
                                })}
                                renderValue={(type: any) => (
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <ListItemIcon>
                                            <AttributeIcon
                                                attribute={{
                                                    type,
                                                    name: 'Poll'
                                                }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={type}
                                        />
                                    </div>
                                )}
                            >
                                {
                                    pollOptions.map(type => (
                                        <MenuItem value={type}>
                                            <ListItemIcon>
                                                <AttributeIcon
                                                    attribute={{
                                                        type,
                                                        name: 'Poll'
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={type}
                                            />
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        }
                    </div>
                    <FormSingleChoice
                        options={post.poll.options}
                        editing
                        type={post.poll.type}
                        minOptions={2}
                        maxOptions={10}
                        onChange={(options) => onChange({
                                ...post, 
                                poll: {
                                    ...post.poll,
                                    options
                                }
                        })}
                    />
                </div>
            ]
        },
        {
            type: 'Question',
            attributes: [
                (
                    <UserAttributeEditor
                        users={post.assignees}
                        onChange={requestees => onChange({...post, requestees})}
                        placeholder={"Request Answers"}
                    />
                ),
            ]
        },
    ]
    
    const attributes = attributeEditors.find(({type}) => post.type === type)?.attributes
    return (
        <div style={style}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <Typography variant='h6' style={{marginRight: 11, paddingLeft: 8, fontSize: 25}}>
                    #
                </Typography>
                <TagSelector
                    value={post.tags}
                    onChange={(tags) => onChange({...post, tags})}
                    size="small"
                    limit={10}
                />
            </div>
            {
                attributes && attributes.map(attr => (
                    <div style={{marginTop: 15}}>
                        {attr}
                    </div>
                ))
            }
            <Collapse in={state.expanded}>
                <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                    <Groups style={{marginRight: 10}}/>
                    <SpaceSelector
                        value={post.spaces}
                        onChange={(spaces) => onChange({...post, spaces})}
                    />
                </div>
            </Collapse>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 15}}>
                <Button 
                    startIcon={state.expanded ? <ExpandLess/> : <ExpandMore/>}
                    onClick={() => setState({...state, expanded: !state.expanded})}
                >
                    {state.expanded ? 'Less Options' : 'More Options'}
                </Button>
            </div>
        </div>
    )
}
