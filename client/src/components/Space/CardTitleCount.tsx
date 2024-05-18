import { TypographyProps } from '@material-ui/core'
import React from 'react'
import Typography from '../Shared/Typography'

interface CardTitleCountProps {
    count: number,
    title: string,
    typographyProps?: TypographyProps,
}

export default function CardTitleCount({title, typographyProps, count, style, ...props}: CardTitleCountProps & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} style={{...style, display: 'flex', alignItems: 'center'}}>
            <Typography
                variant="h6"
                {...typographyProps}
            >
                {title}
            </Typography>
            <Typography
                color="textSecondary"
                {...typographyProps}
                style={{marginLeft: 10, ...typographyProps?.style}}
            >
                {`\u2022`}
            </Typography>
            <Typography
                color="textSecondary"
                {...typographyProps}
                style={{marginLeft: 10, ...typographyProps?.style}}
                
            >
                {`${count}`}
            </Typography>
        </div>
    )
}
