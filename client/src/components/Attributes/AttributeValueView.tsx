import { Popover, Checkbox, Chip, hexToRgb, IconButton, ListItem, MenuItem, Typography, Tooltip } from '@material-ui/core'
import { ArrowDropDown, ArrowDropDownCircle, ArrowDropDownCircleOutlined, CalendarToday, CalendarTodayOutlined, PersonAdd, PersonAddOutlined } from '@material-ui/icons'
import { getDateString, getNowDateDiff, timeAgo } from '../../utils/dateutils';
import ChipList from '../Shared/ChipList';
import { adjustRGBBrightness } from '../../utils/colorutils'
import { AttributeValue, Attribute } from '../../types/database'
import UserPreview from '../User/UserPreview';
import UserIcon from '../User/UserIcon';
import PostPreviewBase from '../Post/PostPreviewBase';
import UserIconBase from '../User/UserIconBase';
import React, { useState } from 'react';
import { Anchor } from '../Post/PostContentEditor';
import CalendarPicker from '@mui/lab/CalendarPicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import UserSelector from '../Shared/UserSelector';
import { Link } from 'react-router-dom';
import TagSelector from '../Tags/TagSelector';
import TextField from '../Shared/TextField';
import Button from '../Shared/Button';
import { CirclePicker } from 'react-color';

export interface AttributeValueProps {
    attributeValue: AttributeValue,
    attribute: Attribute
    showLabel?: boolean
    showPlaceholder?: boolean,
    simple?: boolean,
    editingAnchor?: Anchor,
    editing?: boolean,
    changeAttributeValue?: (value: any) => void,
    changeAttribute?: (attribute: Attribute) => void,
    onClose?: () => void,
    showButton?: boolean,
    inGroup?: boolean
}


const getTransformedColor = (attribute: Attribute, value: any) => {

    let color: string | undefined = '#FFF'
    if (attribute.options) {
        color = attribute.options.find((option) => option.value === value)?.color
    }

    return color
}

export default function AttributeValueView({simple, inGroup, changeAttribute, editingAnchor, showButton, onClose, changeAttributeValue, editing, attributeValue, attribute, showLabel, showPlaceholder}: AttributeValueProps) {
    const {
        value,
    } = attributeValue;

    const {
        name,
        type
    } = attribute

    const [state, setState] = useState({
        value,
        color: getTransformedColor(attribute, value)
    })
    

    const noneLabel = showPlaceholder ? <Typography variant="caption" color="textSecondary">None</Typography> : <span/>


    switch (type) {
        case 'Checkbox': {
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Checkbox
                        checked={!!value}
                    />
                    {
                        showLabel && 
                        <Typography
                            variant="caption"
                        >
                            {name}
                        </Typography>
                    }
                    
                </div>
            )
        }
        case 'Text': {
            return (
                <div>
                    <Typography>
                        {value}
                    </Typography>
                </div>
            )
        }
        case 'Title': {
            return (
                <div>
                    <Typography>
                        {value}
                    </Typography>
                    <Popover 
                        anchorEl={editingAnchor} 
                        open={!!editing}
                        onClose={onClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <div style={{padding: 10}}>
                            <TextField
                                value={value}
                                onKeyPress={({key}) => key === "Enter" && onClose && onClose()}
                                size="small"
                                autoFocus
                                variant="plain"
                                style={{marginBottom: -3}}
                                onChange={(e) => changeAttributeValue && changeAttributeValue(e.target.value)}
                            />
                        </div>
                    </Popover>
                </div>
            )
        }
        case 'Date': {
            let dateString: string = '';
            let hide = false;
            let date = null;
            if (value) {
                date = new Date(value as unknown as Date);
                dateString = date.toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})
            } else if (showPlaceholder) {
                hide = true
                dateString = 'None'
            }

            return (
                <div>
                    {
                        hide ? 
                        noneLabel
                        :
                        <Typography variant="caption">
                            {dateString}
                        </Typography>
                    }
                    {
                        !value && showButton && 
                        <Tooltip
                            title={attribute.name}
                        >
                            <IconButton size="small">
                                <CalendarTodayOutlined fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    }
                    <Popover anchorEl={editingAnchor} open={!!editing} onClose={onClose}>
                        <div style={{position: 'relative'}}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <CalendarPicker
                                    date={date}
                                    onChange={(value) => changeAttributeValue && changeAttributeValue(value)}
                                />
                            </LocalizationProvider>
                            <div style={{position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center'}}>
                                <Button
                                    size="small"
                                    style={{marginRight: 5}}
                                    onClick={() => {changeAttributeValue && changeAttributeValue(null); onClose && onClose()}}
                                >
                                    Clear
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="contained"
                                    color='primary'
                                    size="small"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </Popover>
                </div>
            )
        }
        case 'Select': {
            
            let color = getTransformedColor(attribute, value)
            color = color ? adjustRGBBrightness(hexToRgb(color), 0.2) : '';

            const onClick = () => {
                if (changeAttribute && attribute.options) {
                    const newOptions = [...attribute.options]
                    const option = newOptions.find(o => o.value === value)
                    if (option) {
                        option.value = state.value
                        option.color = state.color
                    }
                    changeAttribute && changeAttribute({
                        ...attribute, 
                        options: newOptions
                    })
                    onClose && onClose()
                }
            }
            return (
                <div>
                    {
                        value && 
                        <Chip
                            style={{backgroundColor: color}}
                            label={value}
                            size="small"
                        />
                    }
                    <Popover anchorEl={editingAnchor} open={!!editing} onClose={onClose}>
                        {
                            !inGroup && 
                            <div>
                                <MenuItem 
                                    style={{width: '100%'}} 
                                    selected={!value} 
                                    onClick={() => {
                                        changeAttributeValue && changeAttributeValue(null)
                                        onClose && onClose()
                                    }}
                                >
                                    <Chip
                                        style={{backgroundColor: color ? adjustRGBBrightness(hexToRgb(color), 0.25) : 'transparent'}}
                                        label={"None"}
                                        size="small"
                                    />
                                </MenuItem>
                                {
                                    attribute?.options && attribute?.options.map(({color, ...option}) => (
                                        <MenuItem 
                                            style={{width: '100%'}} 
                                            selected={value === option.value} 
                                            onClick={() => {
                                                changeAttributeValue && changeAttributeValue(option.value)
                                                onClose && onClose()
                                            }}
                                        >
                                            <Chip
                                                style={{backgroundColor: color ? adjustRGBBrightness(hexToRgb(color), 0.25) : 'transparent'}}
                                                label={option.value}
                                                size="small"
                                            />
                                        </MenuItem>
                                    ))
                                }
                            </div>
                        }
                        {
                            inGroup &&
                            <div style={{padding: 15}}>
                                <div style={{display: 'flex', alignItems: 'center', marginBottom: 15}}>
                                    <TextField
                                        value={state.value}
                                        autoFocus
                                        placeholder={"Edit Name"}
                                        onChange={e => setState({...state, value: e.target.value})}
                                        size="small"
                                        fullWidth
                                        onKeyPress={({key}) => key === 'Enter' && state.value.length > 0 && onClick()}
                                    />
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        disabled={state.value.length === 0}
                                        style={{marginLeft: 5}}
                                        size="small"
                                        onClick={onClick}
                                    >
                                        Save
                                    </Button>
                                </div>
                                <CirclePicker
                                    color={state.color ? state.color : '#FFF'}
                                    onChange={({hex}: {hex: string}) => {
                                        setState({
                                            ...state,
                                            color: hex
                                        })
                                    }} 
                                />
                            </div>
                        }
                    </Popover>
                    {
                        !value && 
                        <React.Fragment>
                            {
                                showButton ? 
                                <Tooltip
                                    title={attribute.name}
                                >
                                    <IconButton size="small">
                                        <ArrowDropDownCircleOutlined fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                                :
                                noneLabel
                            }
                        </React.Fragment>
                    }
                    
                </div>
            )
        }
        case 'Multi-select': {
            return (
                <div>
                    <ChipList
                        options={value ? value : []}
                    />
                    {
                        showPlaceholder && (!value || value.length === 0) && 
                        noneLabel
                    }
                </div>
            )
        }
        case 'Tags': {
            return (
                <div>
                    {
                        value?.map((tag: string) => (
                            <Link to={`/tags/${tag}`} style={{marginRight: 10}}># {tag}</Link>
                        ))
                    }
                    {
                        showPlaceholder && (!value || value.length === 0) && 
                        noneLabel
                    }
                    <Popover anchorEl={editingAnchor} open={!!editing} onClose={onClose}>
                        <div style={{padding: 5, minWidth: 250}}>
                            <TagSelector
                                value={value}
                                variant='plain'
                                autoFocus
                                onChange={(value) => changeAttributeValue && changeAttributeValue(value)}
                            />
                        </div>
                    </Popover>
                </div>
            )
        }
        case 'Relation': {
            return (
                <span>
                    {
                        value.map((p: any) => (
                            <PostPreviewBase
                                {...p}
                            />
                        ))
                    }
                </span>
            )
        }
        case 'Person': {
            const iconProps = {size: 30}
            return (
                <div>
                    {
                        simple ? 
                        <span style={{display: 'flex', marginRight: 5}}>
                            {
                                value && value.slice(0, 5).map((user: any) => (
                                   <span style={{marginRight: -5}}>
                                        <UserIconBase {...iconProps} {...user} size={25}/>
                                   </span>
                                ))
                            }
                        </span>
                        :
                        <span style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                            {
                                value && value.map(({...user}: any) => (
                                   <div style={{display: 'flex', alignItems: 'center', marginRight: 10, marginBottom: value.length > 2 ? 5 : 0}}>
                                        <UserIconBase {...iconProps} {...user} size={25} style={{marginRight: 5}}/>
                                        <Typography variant="caption">{user.firstname} {user.lastname}</Typography>
                                   </div>
                                ))
                            }
                        </span>
                    }
                    {
                        (!value || value.length === 0)  && 
                        <React.Fragment>
                            {
                                showButton ? 
                                <Tooltip
                                    title={attribute.name}
                                >
                                    <IconButton size="small">
                                        <PersonAddOutlined   fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                                :
                                noneLabel
                            }
                        </React.Fragment>
                    }
                    <Popover anchorEl={editingAnchor} open={!!editing} onClose={onClose}>
                        <div style={{padding: 5, minWidth: 250}}>
                            <UserSelector
                                value={value}
                                variant="plain"
                                autoFocus
                                onChange={(value) => changeAttributeValue && changeAttributeValue(value)}
                            />
                        </div>
                    </Popover>
                </div>
            )
        }
    }
    
    return (
        <div>
            Attribute
        </div>
    )
}
