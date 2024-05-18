import React, { ReactElement } from 'react';
import { Chip, CircularProgress, ChipProps, TextFieldProps, Size } from '@material-ui/core';
import UserIcon from '../User/UserIconOld';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import Typography from './Typography';
import TextField, { TextFieldExtendedProps } from './TextField';
import { Done } from '@material-ui/icons';

export interface SelectorInputProps {
    id?: string
    style?: React.CSSProperties,
    suggestions?: any[],
    value: any[],
    autoFocus?: boolean
    options: any[],
    autoHighlight?: boolean,
    disabled?: boolean
    fullWidth?: boolean,
    limit?: number,
    placeholder?: string,
    noOptionsText?: string
    onChange: (value: any[]) => void,
    getOptionLabel: (value: any) => string,
    getChipProps?: (value: any) => Partial<ChipProps>,
    renderOption: (value: any) => ReactElement,
    searchOptions: (query: string) => void,
    textFieldProps?: Partial<TextFieldExtendedProps>,
    size?: Size,
    variant?: 'outlined' | 'plain',
    renderTags?: (value: any) => ReactElement,
    onQueryChange?: (query: string) => void,
    queryValue?: string,
    freeSolo?: boolean,
    min?: number
}

export default function SelectorInput({value, min, queryValue, autoFocus, freeSolo, onQueryChange, suggestions, renderTags, placeholder, options, onChange, textFieldProps, getOptionLabel, getChipProps, renderOption, limit, searchOptions, ...props}: SelectorInputProps) {
    const [state, setState] = React.useState({
        loading: false,
        focused: false,
        value: ''
    })
    
    let alreadyInOptions = false
    options.forEach(opt => {
        if (opt === state.value) {
            alreadyInOptions = true
        }
    })
    if (!alreadyInOptions) {
        value.forEach(opt => {
            if (opt === state.value) {
                alreadyInOptions = true
            }
        })
    }

    const allOptions = (freeSolo && !alreadyInOptions && state.value.length > 0) ? [state.value, ...options] : options

    return (
        <div style={{width: '100%'}}>
            {
                suggestions && 
                <div style={{marginBottom: 5}}>
                    {
                        suggestions.map(bc => {
                            const selected = value.find(v => getOptionLabel(v) === getOptionLabel(bc));
                            return (
                                <Chip 
                                    variant={selected ? 'default' : "outlined"}
                                    icon={selected && <Done/>}
                                    color={selected ? 'primary' : "default"} 
                                    label={getOptionLabel(bc)}
                                    onClick={() => onChange(selected ? value.filter(v => v !== bc) : [...value, bc])}
                                    style={{marginRight: 5, marginBottom: 5}}
                                />
                            )
                        })
                    }
                    {
                        value.filter(v => !suggestions.find(s => getOptionLabel(v) === getOptionLabel(s))).map((v) => (
                            <Chip
                                icon={<Done/>}
                                label={getOptionLabel(v)}
                                style={{marginRight: 5, marginBottom: 5}}
                            />
                        ))
                    }
                </div>
            }

            

            <Autocomplete
                {...props}
                multiple
                options={allOptions}
                freeSolo={freeSolo}
                getOptionLabel={getOptionLabel}
                value={value}
                onChange={(e, value) => onChange(value)}
                renderTags={renderTags ? renderTags : (values, getTagProps) => (
                    !suggestions && values.map((v: any, index: number) => (
                        <Chip
                            {...getTagProps({ index })}
                            {...(getChipProps ? getChipProps(v) : {})}
                            label={getOptionLabel(v)}
                            style={{marginRight: 5}}
                            onDelete={(min && index < min) ? undefined : (getTagProps({index}) as any).onDelete}
                        />
                    ))
                )}
                autoHighlight
                renderOption={renderOption}
                open={state.focused && value.length < (limit ? limit : Number.MAX_SAFE_INTEGER)}
                onFocus={() => setState({...state, focused: true})}
                onBlur={() => setState({...state, focused: false})}
                renderInput={(params) => {return (
                    <TextField
                        {...params}
                        {...textFieldProps}
                        placeholder={placeholder}
                        // ensures that textField props doesn't override params
                        InputProps={{
                            ...params.InputProps,
                            ...textFieldProps?.InputProps,
                            readOnly: limit === value.length,
                            endAdornment: state.loading && <CircularProgress size={25}/>
                        }}
                        inputProps={{
                            ...params.inputProps,
                            ...textFieldProps?.inputProps
                        }}
                        InputLabelProps={{
                            ...params.InputLabelProps,
                            ...textFieldProps?.InputLabelProps
                        }}
                        autoFocus={autoFocus}
                        onChange={e => {
                            setState({...state, value: e.target.value})
                            searchOptions(e.target.value)
                        }}
                    />
                )}}
            />
        </div>
    )
}
