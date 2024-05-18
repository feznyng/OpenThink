import React, { useRef } from 'react';
import { AttachFile, AddPhotoAlternate } from '@material-ui/icons';
import { IconButton, Tooltip } from '@material-ui/core';
import { v4 as uuid } from 'uuid';
import { FilePreviewItem } from '../File/FilePreview';

const attachActions = [
    {
        name: 'Photo/Video',
        icon: <AddPhotoAlternate/>
    },
    {
        name: 'File',
        icon: <AttachFile/>
    },
]

const MAX_POST_FILES = 4
const MAX_POST_MEDIA = 4

interface PostAttachActionsProps {
    onChange: (post: {
        files: FilePreviewItem[],
        media: FilePreviewItem[]
    }) => void,
    post: {
        files: FilePreviewItem[],
        media: FilePreviewItem[]
    }
}

export default function PostAttachActions({onChange, post}: PostAttachActionsProps) {
    const imageInputRef: any = useRef()
    const fileInputRef: any = useRef()

    const attachOptions = (name: string) => {
        switch(name) {
            case 'File':
                fileInputRef.current.click()
                break
            case 'Photo/Video':
                imageInputRef.current.click()
                break
        }
    }

    const addFiles = (e: any) => {
        const files = (Array.from(e.currentTarget.files) as any).map((file: File) => ({
            file,
            title: file.name,
            type: file.type,
            size: file.size,
            description: '',
            id: uuid()
        }))
        onChange({
            ...post,
            files: [
                ...post.files,
                ...files
            ].slice(0, MAX_POST_FILES)
        })
    }

    const addMedia = (e: any) => {
        const media = (Array.from(e.currentTarget.files) as any).map((file: File) => ({
            file,
            title: file.name,
            type: file.type,
            size: file.size,
            description: '',
            id: uuid()
        }))
        onChange({
            ...post,
            media: [
                ...post.media,
                ...media
            ].slice(0, MAX_POST_MEDIA)
        })
    }
    
    return (
        <div>
            {
                attachActions.map(({name, icon}) => (
                    <Tooltip title={name}>
                        <IconButton 
                            size="small" 
                            style={{marginRight: 15}} 
                            onClick={() => attachOptions(name)}
                        >
                            {icon}
                        </IconButton>
                    </Tooltip>
                ))
            }
            <input onChange={addFiles} ref={fileInputRef as any} type="file" style={{display: 'none'}} multiple/>
            <input onChange={addMedia} ref={imageInputRef as any} type="file" style={{display: 'none'}} multiple accept="image/*,video/*"/>
        </div>
    )
}
