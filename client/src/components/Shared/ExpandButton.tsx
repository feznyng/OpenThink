import { ButtonProps } from '@material-ui/core'
import { ExpandLess, ExpandMore } from '@material-ui/icons'
import Button from './Button'

interface ExpandButtonProps {
    expanded?: boolean
}

export default function ExpandButton({expanded, ...props}: ExpandButtonProps & ButtonProps) {
    return (
        <Button
            startIcon={expanded ? <ExpandLess/> : <ExpandMore/>}
            {...props}
        >
            See More
        </Button>
    )
}
