import React, { CSSProperties, Fragment, useRef, useState } from 'react'
import TextField, { TextFieldExtendedProps } from '../Shared/TextField';
import Button from '../Shared/Button';
import { Close, Image } from '@material-ui/icons';
import { Fade } from '@mui/material';
import PostContentEditor, { PostContentEditorProps } from '../Post/PostContentEditor';
import { Content } from '@tiptap/react';
import AttributeTable from '../Attributes/AttributeTable';
import { Attribute, AttributeValueMap } from '../../types/database'
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core';
import { changeImage, deleteImage, getImage } from '../../actions/S3Actions';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from 'emoji-mart';
import Typography from '../Shared/Typography';
import { UploadFile } from '@mui/icons-material';

interface PostViewProps {
    postId?: number
    content: Content
    title: string,
    icon?: string,
    banner?: string,
    attributes?: Attribute[]
    attributeValues?: AttributeValueMap
    onContentChange: (content: Content) => void
    onTitleChange: (title: string) => void,
    onIconChange?: (icon: string | null) => void,
    onBannerChange?: (banner: string | null) => void,
    onAttributeChange?: (key: string, value: any) => void
    contentLoaded?: boolean
    style?: CSSProperties
    titleProps?: Partial<TextFieldExtendedProps>,
    contentProps?: Partial<PostContentEditorProps>,
    hideAttributes?: boolean
    hideImageButtons?: boolean,
    readonly?: boolean
}

export default function PostView({contentLoaded, style, icon, onIconChange, banner, onBannerChange, content, readonly, postId, title, hideImageButtons, attributes, hideAttributes, attributeValues, onAttributeChange, onContentChange, onTitleChange, titleProps, contentProps}: PostViewProps) {
    const [state, setState] = useState<any>({
        hover: false,
        anchorEl: false
    })
    const titleInput = React.useRef();
    const titleRef = useRef()

    const fileRef = React.useRef()

    const uploadImage = async () => {
        const fileList = (fileRef.current as any).files;
        // upload image
        setState({...state, anchorEl: null})
        if (fileList.length > 0 && state.imageType) {
            // delete old icon if it exists
            const file: File = fileList[0]
            const path = `posts/${state.imageType}/` + uuidv4() + `/${file.name}`
            await changeImage(path, file)
            setTimeout(() => {
                if (state.imageType === 'icon') {
                    onIconChange && onIconChange(path)
                } else {
                    onBannerChange && onBannerChange(path)
                }
            }, 300)
            
        }
    }

    const removeImage = async () => {
        if (state.imageType === 'icon' && icon && icon?.length > 0) {
            onIconChange && onIconChange(null)
            deleteImage(icon)
        }

        if (state.imageType === 'banner' && banner && banner?.length > 0) {
            onBannerChange && onBannerChange(null)
            deleteImage(banner)
        }
        
        setState({...state, anchorEl: null})
    }

    hideImageButtons = hideImageButtons || !!(!onBannerChange && (!onIconChange || icon))

    return (
        <div style={{...style, width: '100%'}}>
            <div
                onMouseEnter={() => setState({...state, hover: true})} 
                onMouseLeave={() => setState({...state, hover: false})}
            >
                {
                    !readonly && !hideImageButtons && 
                    <div
                        style={{width: '100%', height: 40, ...titleProps?.style}}
                    >
                        <Fade
                            in={!!state.hover || state.anchorEl}
                        >
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                {
                                    !icon && onIconChange && 
                                    <Button
                                        startIcon={'🎁'}
                                        onClick={e => setState({...state, anchorEl: e.currentTarget, imageType: 'icon'})}
                                    >
                                        Add Icon
                                    </Button>
                                }
                                {
                                    onBannerChange && 
                                    <Button
                                        startIcon={<Image/>}
                                        onClick={e => setState({...state, anchorEl: e.currentTarget, imageType: 'banner'})}

                                    >
                                        Add Cover
                                    </Button>
                                }
                                
                            </div>
                        </Fade>
                    </div>
                }
                <input onChange={uploadImage} accept="image/*" type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={fileRef as any} />
               
                <Menu
                    open={!!state.anchorEl}
                    anchorEl={state.anchorEl}
                    onClose={() => setState({...state, anchorEl: null})}
                >
                    <MenuItem onClick={() => (fileRef.current as any).click()}>
                        <ListItemIcon>
                            <UploadFile/>
                        </ListItemIcon>
                        <ListItemText
                            primary={'Upload Image'}
                        />
                    </MenuItem>
                    {
                        icon && 
                        <MenuItem onClick={() => removeImage()}>
                            <ListItemIcon>
                                <Close/>
                            </ListItemIcon>
                            <ListItemText
                                primary={'Remove Image'}
                            />
                        </MenuItem>
                    }
                </Menu>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {
                        icon && 
                        <div style={{width: 75, height: 75, marginRight: 10}}>
                            {
                                icon.length === 1 ?
                                <Typography
                                    style={{fontSize: 75}}
                                    onClick={(e) => {setState({...state, imageType: 'icon', anchorEl: e.currentTarget})}}
                                >
                                    {icon}
                                </Typography>
                                :
                                <img
                                    src={getImage(icon)}
                                    style={{height: 75, width: 75, cursor: 'pointer', borderRadius: 20}}
                                    onClick={(e) => {setState({...state, imageType: 'icon', anchorEl: e.currentTarget})}}
                                />
                            }
                        </div>
                    }

                    <TextField
                        {...titleProps}
                        style={{...titleProps?.style}}
                        value={title}
                        variant={titleProps?.variant ? titleProps.variant : 'plain'}
                        InputProps={{
                            ...titleProps?.InputProps,
                            style: {fontSize: 30, fontWeight: 'bold', ...titleProps?.InputProps?.style,},
                            readOnly: readonly
                        }}
                        defaultValue={title}
                        inputRef={titleInput}
                        onChange={(e) => onTitleChange(e.target.value)}
                        ref={titleRef as any}
                        fullWidth
                        multiline
                    />
                </div>
            </div>
            {
                attributes && attributeValues && !hideAttributes && 
                <AttributeTable
                    attributes={attributes}
                    attributeValues={attributeValues}
                    readonly={!onAttributeChange || readonly}
                    changeAttributeValue={(attribute, value) => onAttributeChange && onAttributeChange(attribute.name, value)}
                />
            }
           <PostContentEditor
                {...contentProps}
                content={content} 
                onChange={onContentChange}
                postId={postId}
                readonly={readonly}
                variant={contentProps?.variant ? contentProps.variant : 'plain'}
                style={{marginTop: 10}}
            />
        </div>
    )
}
