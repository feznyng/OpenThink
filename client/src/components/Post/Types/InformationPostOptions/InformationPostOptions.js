import React from 'react'
import {Checkbox} from '@material-ui/core'
export default function InformationPostOptions(props) {
    return (
        <span>

            <div onClick={() => props.onPostChange({...props.newPost, wiki: !props.newPost.wiki})} style={{cursor: 'pointer'}}>
                <Checkbox checked={props.newPost.wiki ? props.newPost.wiki : false} /> Wiki
            </div>
            
            <div onClick={() => props.onPostChange({...props.newPost, pinned: !props.newPost.pinned})} style={{cursor: 'pointer'}}>
                <Checkbox checked={props.newPost.pinned ? props.newPost.pinned : false} /> Pinned
            </div> 
        
        </span>
    )
}
