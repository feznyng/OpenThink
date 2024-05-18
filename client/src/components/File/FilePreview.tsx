import { ListItem, ListItemIcon, ListItemProps, ListItemText } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import { CSSProperties, Fragment, ReactElement, useState } from 'react';
import DeleteFileButton from './DeleteFileButton';
import FilePreviewActions from './FilePreviewActions';
import FileIcon from './FileIcon';

export interface FilePreviewItem {
    file?: File,
    title: string,
    description?: string,
    type?: string,
    id: string, // local or temporary id
    link?: string, // link to the file (relative path in S3)
    postId: number, // the post that backs up this file
}

export interface FilePreviewProps {
    item: FilePreviewItem,
    editable?: boolean,
    icon?: ReactElement,
    previewSize?: number,
    onDelete?: (file: FilePreviewItem) => void,
    onClick?: (item: FilePreviewItem) => void,
    style?: CSSProperties,
    variant?: 'grid' | 'list',
    listItemProps?: Partial<ListItemProps>,
    showActions?: boolean,
    downloadFile?: (file: FilePreviewItem) => void
}

export default function FilePreview({item, variant, downloadFile, onDelete, onClick, style, showActions, icon, previewSize, listItemProps}: FilePreviewProps) {
    const [state, setState] = useState({
        hover: false
    })
    variant = variant ? variant : 'list'
    
    const fileIcon = <FileIcon file={item.file} name={item.file ? item.file.name : item.title} link={item.link} type={item.file ? item.file.type : (item.type ? item.type : '')} size={previewSize}/>
    if (variant === 'list') {
        return (
            <div 
                style={{width: '100%', height: '100$', position: 'relative'}}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
            >
                <ListItem 
                    {...listItemProps as any} 
                    style={{...listItemProps?.style, ...style}} 
                    onClick={() => onClick && onClick(item)}
                    
                >
                    <ListItemIcon>
                        {icon ? icon : fileIcon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.title}
                    />
                </ListItem>
                <div
                    style={{position: 'absolute', top: 0, height: '100%', display: 'flex', alignItems: 'center', right: 30}}
                >
                    {
                        onDelete && 
                        <DeleteFileButton
                            onClick={() => onDelete(item)}
                            
                        />
                    }
                    {
                        state.hover && showActions && 
                        <FilePreviewActions
                            item={item}
                            downloadFile={() => downloadFile && downloadFile(item)}
                        />
                    }
                </div>
            </div>
        )
    }

    return (
        <div
            style={{position: 'relative', ...style}}
            onClick={() => onClick && onClick(item)}
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
        >
            {icon ? icon : fileIcon}
            <div
                style={{position: 'absolute', top: 10, right: 10}}
            >
                {
                    onDelete && 
                    <DeleteFileButton
                        onClick={() => onDelete(item)}                        
                    />
                }
            </div>
           
        </div>
    )
}
