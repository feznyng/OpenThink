import { ChevronLeft, ChevronRight } from '@material-ui/icons'
import React from 'react'
import Button from './Button'

interface NavButtonProps {
    back?: boolean,
    onClick?: () => void,
    style?: React.CSSProperties
    disabled?: boolean
}

export default function NavButton({back, ...props}: NavButtonProps) {
    return (
        <Button
            {...props}
            variant={back ? 'text' : 'contained'}
            startIcon={back && <ChevronLeft/>}
            endIcon={!back && <ChevronRight/>}
        >
            {back ? 'Back' : 'Next'}
        </Button>
    )
}
