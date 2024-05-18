import { AvatarGroup } from '@material-ui/lab';
import React from 'react'
import { space } from '../../types/space'
import SpaceIcon from '../Space/SpaceIconOld';
import SpacePreview from '../Space/SpacePreviewButton';

export default function SpaceIconList({spaces, previewProps}: {spaces: space[], previewProps: any}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', marginLeft: '5%'}}>
            {
                spaces.map(s => (
                    <SpacePreview {...previewProps} s={s} style={{...previewProps?.style, marginLeft: '-5%'}}/>
                ))
            }
        </div>
    )
}
