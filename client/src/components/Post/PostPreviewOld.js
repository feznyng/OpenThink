import React from 'react'
import {Typography} from '@material-ui/core';
import PostIcon from './PostIconOld'

export default function PostPreview(props) {
    const {p, color, expanded, shortened} = props;
    if (!expanded) {
        return (
            <div style={{height: 55, overflow: 'hidden',}}>
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <PostIcon post={p} height={25} width={25} color={color}/>        
                </div>
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Typography style={{fontSize: 14, color: color ? color : ''}} variant="p">{p.title.substring(0, 10) + (p.title.length > 10 ? '...' : '')}</Typography>
                </div>
            </div>
        )
    } else {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <PostIcon post={p} height={25} width={25}/>
                <Typography style={{fontSize: 14}} variant="p">{shortened ? p.title.substring(0, 5) + (p.title.length > 5 ? '...' : '') : p.title}</Typography>
            </div>
        )
    }
    
}
