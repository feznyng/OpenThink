import { ButtonProps } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, {useState} from 'react';
import Button from '../Shared/Button';

export default function DeleteFileButton({style, ...props}: ButtonProps) {
    const [state, setState] = useState({
        hover: false
    })

    return (
        <Button 
            {...props}
            style={{
                ...style,
                minWidth: 25, 
                width: 25, 
                maxWidth: 25, 
                minHeight: 25, 
                height: 25, 
                maxHeight: 25, 
                backgroundColor: '#5D6164', 
                opacity: state.hover ? 1 : 0.8,
                color: 'white',
                position: 'absolute'
            }}
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
        >
            <Close fontSize='small'/>
        </Button>
    )
}
