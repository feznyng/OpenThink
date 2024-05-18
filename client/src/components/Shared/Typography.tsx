import React from 'react'
import {Link, Typography as MuiTypography, TypographyProps} from '@material-ui/core'

export interface CustomTypographyProps {
    hoverStyle?: React.CSSProperties,
    truncate?: number,
    expandDisabled?: boolean,
    clickable?: boolean
}

export default function Typography({style, hoverStyle, onMouseEnter, clickable, expandDisabled, onMouseLeave, children, truncate, ...props}: CustomTypographyProps & TypographyProps) {
    const [state, setState] = React.useState({
        hover: false,
        expanded: false,
    })

    let content = children;
    let truncateText = ''
    if (content && typeof(content) === 'string' && truncate) {
        let text: string = content.substring(0, state.expanded ? content.length : truncate)
        const lastChar = text.substring(text.length - 1, text.length);
        truncateText = `${lastChar === '.' ? '' : '.'}..`

        content = text;
    }

    return (
        <MuiTypography
            {...props}
            style={state.hover ? (clickable ? {...style, ...hoverStyle, textDecoration: 'underline', cursor: 'pointer'} : {...style, ...hoverStyle}) : style}

            onMouseEnter={(e) => {
                setState({
                    ...state,
                    hover: true,
                })
                onMouseEnter && onMouseEnter(e);
            }}
            onMouseLeave={(e) => {
                setState({
                    ...state,
                    hover: false,
                })
                onMouseLeave && onMouseLeave(e);
            }}
        >
            {content}{truncateText}
            {
                !!truncate && content && !expandDisabled &&
                <Link
                    style={{cursor: 'pointer'}}
                    onClick={() => setState({...state, expanded: !state.expanded})}
                > 
                    
                    {state.expanded ? 'See Less' : 'See More'}
                </Link>
            }
        </MuiTypography>
    )
}
