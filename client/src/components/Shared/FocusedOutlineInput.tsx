import { TextField, TextFieldProps } from '@material-ui/core'
import React from 'react'
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
    root: (props: {focused: boolean}) => ({
      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: props.focused ? 'grey' : 'transparent',
        borderWidth: 1
      },
    })
});
  

export default function FocusedOutlineInput(props: TextFieldProps) {
    const [state, setState] = React.useState({
        focused: false,
    })

    const classes = useStyles({focused: state.focused});

    return (
        <TextField
            {...props}
            className={classes.root}
            onFocus={() => setState({...state, focused: true})}
            onBlur={() => setState({...state, focused: false})}
        />
    )
}
