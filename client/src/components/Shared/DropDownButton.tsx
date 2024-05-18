import { IconButton, IconButtonProps, makeStyles } from '@material-ui/core'
import { ChevronRight } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    root: {
        "&:hover": {
            //you want this to be the same as the backgroundColor above
            backgroundColor: "transparent"
        }
    }
}))

interface DropDownButtonProps {
    open: boolean,
    timeout?: number 
}

const defaultTransitionTime = 150;

export default function DropDownButton({open, timeout, ...props}: DropDownButtonProps & IconButtonProps) {
    const classes = useStyles();

    return (
        <IconButton
            {...props}
            size="small"
            className={classes.root}
            disableFocusRipple
            disableRipple
        >
            <ChevronRight
                style={{transform: open ? 'rotate(90deg)' : '', 
                transition: `transform ${timeout ? timeout : defaultTransitionTime}ms ease`}}
            />
        </IconButton>
    )
}
