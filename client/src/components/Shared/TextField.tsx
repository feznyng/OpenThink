import { TextField as MuiTextField, makeStyles, TextFieldProps, Input } from '@material-ui/core'
import React, { ReactElement } from 'react'

const useStyles = makeStyles(() => ({
    noBorder: {
        border: "none",
    },
}));

interface TextFieldExtensionProps {
    variant?: string,
    startAdornment?: ReactElement
}

export type TextFieldExtendedProps = TextFieldExtensionProps & Omit<TextFieldProps, 'variant'>

export default React.forwardRef(function TextField({variant, startAdornment, ...props}: TextFieldExtendedProps, ref) {
    const [state, setState] = React.useState({
        focused: false,
        hover: false,
    });

    const classes = useStyles();

    const onFocus = (e: any) => {
        props.onFocus && props.onFocus(e)
        setState({...state, focused: true})
    }

    const onBlur = (e: any) => {
        props.onBlur && props.onBlur(e)
        setState({...state, focused: false})
    }

    const onMouseEnter = (e: any) => {
        props.onMouseEnter && props.onMouseEnter(e)
        setState({...state, hover: true})
    }

    const onMouseLeave = (e: any) => {
        props.onMouseLeave && props.onMouseLeave(e)
        setState({...state, hover: false})
    }

    let type = 'outlined'

    if (variant === 'focusOutlined') {
        type = 'outlined';
    } else if (variant === 'plain') {
        type = 'standard';
    } else if (variant) {
        type = variant;
    }

    const InputProps = {
        ...props.InputProps,
        disableUnderline: (props.InputProps as any)?.disableUnderline ? true : variant === 'plain',
        classes: {
            notchedOutline: (variant !== 'focusOutlined' || state.focused || state.hover) ? undefined : classes.noBorder
        },
    }

    return (
        <MuiTextField
            {...props}
            variant={type as any}
            onFocus={onFocus}
            onBlur={onBlur}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            InputProps={InputProps}
            inputProps={{
                ref, 
                ...props.inputProps // let autocomplete override ref
            }}
        />
    )
})
