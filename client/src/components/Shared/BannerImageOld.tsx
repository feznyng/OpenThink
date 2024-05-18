import React from 'react'
import { getImage } from '../../actions/S3Actions';
import { space } from '../../types/space'
import { user } from '../../types/user'
import {isValidHttpUrl} from '../../utils/urlutils'
interface BannerImageProps {
    object: any;
    style?: any
}

export default function BannerImage(props: BannerImageProps) {
    const {
        object,
        style
    } = props;
    
    return (
        <>
            {
                (!object.bannerpic || object.bannerpic === '') ? 
                <img
                    alt=""
                    src={object.defaultBanner}
                    style={style}
                />
                :
                <img
                    alt=""
                    src={ object.bannerpic && isValidHttpUrl(object.bannerpic) ? object.bannerpic : getImage(object.bannerpic)}
                    style={style}
                />
            }
        </>
    )
}
