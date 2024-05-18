import React, {ReactElement} from 'react'

interface MaxWidthWrapperProps {
    children: ReactElement | ReactElement[],
    width?: number | undefined | string,
    style?: React.CSSProperties
}

export default function MaxWidthWrapper({children, width, style}: MaxWidthWrapperProps) {
    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <div style={{...style, maxWidth: width ? width : '100%', width: '100%'}}>
                {children}
            </div>
        </div>
    )
}
