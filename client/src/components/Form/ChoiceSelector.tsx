import { Checkbox, IconButton, LinearProgress, Radio } from '@material-ui/core'
import { CheckCircleOutline, Close } from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'
import React, { CSSProperties, ElementRef } from 'react'
import TextField from '../Shared/TextField'
import Typography from '../Shared/Typography'

const useStyles = (props?: FormOption) => makeStyles(() => {
    return {
        root: {
            "& .MuiLinearProgress-barColorPrimary": {
                backgroundColor: props?.highest ? '#7BC5F6' : "#CFD9DE",
            },
        },
    }
})

export interface FormOption {
    image?: string,
    option: string,
    proportion?: number,
    selected?: boolean,
    highest?: boolean
}

export interface ChoiceSelectorProps {
    editing?: boolean,
    removeable?: boolean,
    other?: boolean,
    id?: string,
    option?: FormOption,
    type: string,
    onChange?: (option: FormOption) => void,
    removeOption?: () => void
    onClick?: () => void,
    onSelect?: (option: FormOption) => void,
    variant?: 'poll' | 'form',
    style?: CSSProperties
}

export default function ChoiceSelector({editing, style, type, variant, id, onClick, onSelect, onChange, removeOption, removeable, option}: ChoiceSelectorProps) {
    const [state, setState] = React.useState({
        currValue: option?.option ? option.option : '',
        newValue: option?.option ? option.option : '',
    })

    const classes = useStyles(option)();
    
    variant = variant ? variant : 'form'

    React.useEffect(() => {
        if (option) {
            setState({
                ...state,
                currValue: option.option ? option.option : '',
            })
        }
        
    }, [option?.option])

    const saveChanges = () => {
        if (state.newValue.length > 0) {
            onChange && onChange({...option, option: state.newValue})
        } else {
            setState({
                ...state,
                newValue: state.currValue
            })
        }
    }

    if (variant === 'poll' && !editing) {
        const percentage = option?.proportion ? option.proportion * 100 : 0
        return (
            <div style={{...style, position: 'relative'}}>
                <div
                    style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                    onClick={() => onSelect && onSelect(option!!)}
                >
                    <LinearProgress
                        className={classes.root}
                        variant="determinate" 
                        value={percentage}
                        style={{width: '100%', height: 28, borderRadius: 5, backgroundColor: 'whitesmoke'}}
                    />
                    <Typography
                        style={{marginLeft: 15, width: 50, fontWeight: option?.highest ? 'bold' : undefined}}
                    >
                        {percentage.toString().substring(0, 4)}%
                    </Typography>
                </div>
                <Typography style={{position: 'absolute', color: 'black', top: 0, left: 5, height: '100%', display: 'flex', alignItems: 'center', fontWeight: option?.highest ? 'bold' : undefined}}>
                    {option?.option} {option?.selected && <CheckCircleOutline fontSize='small' style={{marginLeft: 5}}/>}
                </Typography>
            </div>
        )
    }

    return (
        <div style={{display: 'flex', alignItems: 'center', cursor: !!onSelect ? 'pointer' : undefined, ...style}} onClick={() => onSelect && onSelect(option!!)}>
            {
                type === 'Select' ?  
                <Radio
                    checked={!!option?.selected}
                    disabled={editing}
                />
                :
                <Checkbox
                    disabled={editing}
                    checked={!!option?.selected}
                />
            }
            
            <TextField
                variant={editing ? "standard" : 'plain'}
                value={state.newValue}
                placeholder={onClick ? "Add option" : ''}
                fullWidth={!onClick}
                onClick={onClick}
                id={id}
                InputProps={{
                    readOnly: !!onClick || !editing,
                    style: {cursor: !!onSelect ? 'pointer' : undefined}
                }}
                onFocus={event => {
                    event.target.select();
                }}
                onChange={(e) => setState({
                    ...state, 
                    newValue: e.target.value
                })}
                onBlur={saveChanges}
            />
            {
                editing && 
                <IconButton size="small" onClick={removeOption} style={{visibility: removeable ? 'visible' : 'hidden'}}>
                    <Close fontSize="small"/>
                </IconButton>
            }
        </div>
    )
}