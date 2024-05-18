import { Folder } from '@material-ui/icons';
import React, { CSSProperties, Fragment } from 'react';
import FilePreview, {FilePreviewItem} from '../File/FilePreview';

interface PostFilesProps {
    post: any,
    editable?: boolean,
    onChange: (post: any) => void,
    style?: CSSProperties
}

export default function PostFiles({post, onChange, editable, style}: PostFilesProps) {
    const {files, media} = post
    return (
        <div style={style}>
            <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                {
                    media.map((attachment: any) => (
                        <FilePreview
                            item={attachment}
                            variant='grid'
                            editable={editable}
                            onDelete={({id}: FilePreviewItem) => onChange({
                                ...post,
                                media: post.media.filter((media: any) => media.id !== id)
                            })} 
                            style={{marginRight: 15, marginBottom: 15}}
                            previewSize={240}
                        />
                    ))
                }
            </div>
            <div style={{marginTop: 15}}>
                {
                    files.map((item: FilePreviewItem) => (
                        <FilePreview
                            item={item}
                            listItemProps={{button: true}}
                            onDelete={({id}: FilePreviewItem) => onChange({
                                ...post,
                                files: post.files.filter((file: any) => file.id !== id)
                            })} 
                        />
                    ))
                }
            </div>
        </div>
    )
}
