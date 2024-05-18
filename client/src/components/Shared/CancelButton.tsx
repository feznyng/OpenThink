import { ChevronLeft, ChevronRight, Close } from '@material-ui/icons'
import React from 'react'
import Button from './Button'

interface CancelButtonProps {
    onClick?: (e: React.MouseEvent) => void,
    style?: React.CSSProperties
}

export default function CancelButton({onClick, style}: CancelButtonProps) {
    return (
        <Button
            onClick={onClick}
            startIcon={<Close/>}
            style={style}
        >
            Cancel
        </Button>
    )
}
