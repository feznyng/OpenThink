import { Chip, Typography, TextField, TextFieldProps, OutlinedInputProps } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Done } from '@material-ui/icons';
import React from 'react'
import OutlinedInput from '../OutlinedInput';


interface TagSelectorProps {
    selectedTags: string[],
    onChange: (selectedTags: string[]) => void,
    getTags: () => string[],
    suggestions?: string[]
    placeholder: string,
    type: string
}

export default function TagSelector ({selectedTags, onChange, getTags, suggestions, placeholder, type}: TagSelectorProps) {
    const [state, setState] = React.useState({
        value: '',
        options: []
    })
    return (
        <div onKeyDown={(e) => {
            if (e.key === 'Enter' && [state.value, ...getTags().filter(s => selectedTags.indexOf(s) < 0 && s !== state.value)].length === 1) {
                onChange([...selectedTags, state.value]);
                setState({...state, value: ''})
            }
        }}>
            <Autocomplete
                inputValue={state.value}
                disableClearable
                closeIcon={<span/>}
                options={[state.value, ...getTags().filter(s => selectedTags.indexOf(s) < 0 && s !== state.value)]}
                getOptionLabel={(option) => option}
                renderInput={(params) => <TextField variant="outlined" {...params} onChange={e => setState({...state, value: e.target.value})}  placeholder={placeholder}/>}
                onChange={(_, value, reason) => {
                    if (reason === 'select-option' && value) {
                        onChange([...selectedTags, value]);
                        setState({...state, value: ''})
                    }
                }}
                size="small"
            />
            <div style={{marginTop: 20, minHeight: 40}}>
                {
                    selectedTags.map(s => (
                        <Chip
                            style={{marginRight: 10, marginBottom: 5}}
                            label={s}
                            color="primary"
                            size="small"
                            onClick={() => onChange(selectedTags.filter(ss => ss !== s))}
                            icon={<Done/>}
                        />
                    ))
                }
            </div>
            {
                suggestions && 
                <div >
                    <Typography variant="h6" style={{fontSize: 15}}>
                        {`Suggested ${type}s`}
                    </Typography>
                    <div style={{marginTop: 15}}>
                        {
                            suggestions.filter(s => !selectedTags.find(ss => ss === s)).map(s => (
                                <Chip
                                    style={{marginRight: 10, marginBottom: 10}}
                                    label={s}
                                    size="small"
                                    clickable
                                    variant="outlined"
                                    onClick={() => onChange([...selectedTags, s])}
                                />
                            ))
                        }
                    </div>
                </div>
            }
            
        </div>
    )
}


