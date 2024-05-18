import React from 'react'
import RoundedTextField from '../Shared/RoundedTextField'

interface SearchButtonBarProps {
    style?: React.CSSProperties,
    search: (query: string) => void,
    button?: React.ReactElement | null,
    type: string,
}

export default function SearchButtonBar({search, button, type, ...props}: SearchButtonBarProps) {
    return (
        <div {...props}>
            <div style={{marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <RoundedTextField
                    placeholder={`Search ${type}`}
                    size="small"
                    fullWidth
                    onChange={(e) => search(e.target.value)}
                />
                <span
                    style={{marginLeft: 10}}
                >
                    {button}
                </span>
            </div>
        </div>
    )
}
