import { Add, Remove, Schedule } from '@material-ui/icons'
import React from 'react'
import DatePicker from '@mui/lab/DatePicker';
import TimePicker from '@mui/lab/TimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TextField from '../Shared/TextField';
import Button from '../Shared/Button';


interface DateAttributeEditorProps {
    startValue: Date,
    endValue?: Date | null,
    onStartDateChange: (date: Date | null) => void,
    onEndDateChange?: (date: Date | null) => void,
    includeTime?: boolean,
    placeholder?: string
}

export default function DateAttributeEditor({startValue, placeholder, endValue, includeTime, onStartDateChange, onEndDateChange}: DateAttributeEditorProps) {
    const [state, setState] = React.useState({
        allDay: false
    })

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div>
                <span style={{display: 'flex', alignItems: 'center'}}>
                    <Schedule style={{marginRight: 10}}/>
                    <DatePicker
                        inputFormat="MMM dd, yyyy"
                        value={startValue}
                        onChange={onStartDateChange}
                        renderInput={(params) => (<TextField {...(params as any)} size="small" fullWidth inputProps={{...params.inputProps, placeholder: placeholder ? placeholder : 'Start Date'}}/>)}
                    />
                    {
                        includeTime && 
                        <TimePicker
                            value={startValue}
                            onChange={onStartDateChange}
                            renderInput={(params) => (<TextField {...(params as any)} size="small" style={{marginLeft: 5}} fullWidth inputProps={{...params.inputProps, placeholder: 'End Time'}}/>)}
                        />
                    }
                </span>
                {
                    onEndDateChange && state.allDay && 
                    <span style={{display: 'flex', alignItems: 'center', marginTop: 10}}>
                        <Schedule style={{marginRight: 10}}/>
                        <DatePicker
                            inputFormat="MMM dd, yyyy"
                            value={endValue}
                            onChange={onEndDateChange}
                            renderInput={(params) => (<TextField {...(params as any)} size="small" fullWidth inputProps={{...params.inputProps, placeholder: 'End Date'}}/>)}
                        />
                        {
                            includeTime && 
                            <TimePicker
                                value={endValue}
                                onChange={onEndDateChange}
                                renderInput={(params) => (<TextField {...(params as any)} style={{marginLeft: 5}} size="small" fullWidth inputProps={{...params.inputProps, placeholder: 'End Time'}}/>)}
                            />
                        }
                    </span>
                }
                {
                    onEndDateChange && 
                    <Button 
                        onClick={() => {
                            if (state.allDay)
                                onEndDateChange(null)
                            else {
                                const date = new Date(startValue)
                                date.setHours(date.getHours() + 1)
                                onEndDateChange(date)
                            }
                                
                            setState({...state, allDay: !state.allDay})
                        }} 
                        style={{marginTop: 10, marginLeft: 34}} 
                        startIcon={state.allDay ? <Remove/> : <Add/>} 
                        size="small"
                    >
                        {state.allDay ? `Remove End Date${includeTime ? ' and Time' : ''}` : `Add End Date${includeTime ? ' and Time' : ''}`}
                    </Button>
                }
            </div>
        </LocalizationProvider>
    )
}
