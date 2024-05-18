import React, { useRef } from 'react'
import TextField from '../Shared/TextField'
import PostContentEditor from './PostContentEditor';
import PostTypeSelector from './PostTypeSelector'
import PostTypeAttributesEditor from './PostTypeAttributesEditor'
import PostFilesEditor from './PostFilesEditor';

interface PostEditorProps {
    post: any,
    onChange: (post: any) => void,
    postType?: string,
    existing?: boolean,
    defaultExpanded?: boolean
}

export default function PostEditor({post, postType, defaultExpanded, existing, onChange}: PostEditorProps) {
    const {type, delta, title} = post
    const contentRef = useRef()
    return (
        <div>
            {
                !postType && 
                <PostTypeSelector
                    type={type}
                    onChange={(type) => onChange(({...post, type}))}
                />
            }
           
            <TextField
                style={{marginTop: 10}}
                fullWidth
                placeholder="Title"
                value={title}
                onChange={e => onChange({...post, title: e.target.value})}
                InputProps={{
                    style: {fontSize: 20}
                }}
                size="small"
                autoFocus
            />
            <PostContentEditor
                content={delta}
                onChange={delta => onChange({...post, delta})}
                style={{marginTop: 15, minHeight: 115}}
                ref={contentRef}
                placeholder={"Add a description"}
            />
            <PostTypeAttributesEditor
                style={{marginTop: 15}}
                post={post}
                onChange={post => onChange(post)}
                existing={existing}
                defaultExpanded={defaultExpanded}
            />
            <PostFilesEditor
                post={post}
                onChange={post => onChange(post)}
                editable
                style={{marginTop: 15}}
            />
        </div>
    )
}
