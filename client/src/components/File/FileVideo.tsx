import { Close, PlayArrow } from '@material-ui/icons';
import React, { CSSProperties, useEffect, useState } from 'react';
import { getImage } from '../../actions/S3Actions';

interface FileVideoProps {
    file?: File, 
    link?: string, 
    size?: number,
    style?: CSSProperties
}

export default function FileVideo({file, link, size, style}: FileVideoProps) {

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

    size = size ? size : 50

    return (
        <div style={{position: 'relative'}}>
            <video
                src={link ? getImage(link) : state.src}
                style={{...style, height: size, width: size, objectFit: 'cover'}}
            />
            <div 
                style={{position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
                <PlayArrow style={{fontSize: size / 3}}/>
            </div>
        </div>
    )
}
