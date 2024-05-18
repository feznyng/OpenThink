import { Close } from '@material-ui/icons';
import React, { CSSProperties, useEffect, useState } from 'react';
import { getImage } from '../../actions/S3Actions';

interface FileImageProps {
    file?: File, 
    link?: string,
    size?: number,
    style?: CSSProperties
}

export default function FileImage({file, link, size, style}: FileImageProps) {

    const [state, setState] = useState({
        src: '',
        hover: false
    })
    
    useEffect(() => {
        if (file) {
            const reader = new FileReader()
            reader.onload = function (e) {
                if (e.target?.result)
                    setState({
                        ...state,
                        src: e.target.result as string
                    })
            }
            reader.readAsDataURL(file);
        }
    }, [file])

    return (
        <img
            src={link ? getImage(link) : state.src}
            style={{...style, height: size, width: size, objectFit: 'cover'}}
        />
    )
}
