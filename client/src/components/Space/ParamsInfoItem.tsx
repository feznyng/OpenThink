import { Variant } from '@material-ui/core/styles/createTypography';
import React, { CSSProperties, ReactElement } from 'react'
import Typography from '../Shared/Typography';

interface ParamsInfoItemProps {
    icon: ReactElement,
    title: string,
    variant?: string,
    desc: string,
    project?: boolean,
    style?: CSSProperties
}

export default function ParamsInfoItem({icon, title, variant, desc, project, style}: ParamsInfoItemProps) {

    const size = variant ? variant : 'medium'
    let titleVariant: Variant = 'h6';
    let hideDesc = false;
    switch(size) {
        case 'large':
            titleVariant = 'body1'
            break;
        case 'small':
            titleVariant = 'body1'
            hideDesc = true
            break;
    }

    return (
        <div style={{...style, display: 'flex'}}>
            {icon}
            <div style={{marginLeft: 10, marginTop: (size === 'small' ? 0 :     -5)}}>
                <Typography variant={titleVariant} style={{fontSize: 18}}>
                    {title}
                </Typography>
                {
                    !hideDesc && 
                    <Typography>
                        {desc} {desc.length > 0 && (project ? 'project.' : 'group.')}
                    </Typography>
                }
            </div>
        </div>
    )
}
