import React, { Fragment, useRef, useState } from 'react';
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { getImage } from '../../actions/S3Actions';
import FilePreview, { FilePreviewItem } from '../File/FilePreview';
import FileViewer from '../File/FileViewer';
import Dialog from '../Shared/Dialog';
import { DialogContent, DialogTitle } from '@material-ui/core';
import VideoPlayer from '../Video/VideoPlayer';
import { supportedFiles } from '../File/CodeViewer';
import FilePreviewActions from '../File/FilePreviewActions';

interface PostFilesProps {
    post: any
}

export default function PostFiles({post}: PostFilesProps) {
    const {attachments} = useFragment(
        graphql`
            fragment PostFilesFragment on Post {
                attachments(first: 200) @connection(key: "PostFilesFragment_attachments") {
                    edges {
                        node {
                            title
                            link
                            fileFormat
                            fileSize
                            subtype
                            postId
                            ...FileViewerFragment
                        }
                    }
                }
            }
        `,
        post
    )

    const [state, setState] = useState<{file: any}>({
        file: null
    })

    const attached = attachments.edges.map(({node}: any) => ({...node, id: node.postId}))
    const media = attached.filter(({subtype}: any) => subtype === 'media')
    const files = attached.filter(({subtype}: any) => subtype === 'file')

    const onClick = (file: any) => {
        const fileFormat = file.fileFormat
        if (fileFormat.includes('video') || fileFormat.includes('image') || supportedFiles.includes(fileFormat)) {
            setState({...state, file})
        } else {
            downloadFile(file)
        }
    }

    const downloadFile = (file: FilePreviewItem) => {
        window.open(getImage(file.link, file.title), '_self');
    }

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
                {
                    media.map((file: any) => (
                        <Fragment>
                            {
                                file.fileFormat.includes('image') && 
                                <img
                                    src={getImage(file.link)}
                                    style={{maxWidth: 600, width: '100%', maxHeight: '100%', cursor: 'pointer'}}
                                    onClick={() => setState({...state, file})}
                                />
                            }
                            {
                                file.fileFormat.includes('video') && 
                                <VideoPlayer
                                    link={getImage(file.link)}
                                    id={file.postId}
                                />
                            }
                        </Fragment>
                    ))
                }
            </div>
            <div>
                {
                    files.map(({fileFormat, postId, link, ...file}: any) => {
                        return (
                            <span>
                                <FilePreview
                                    item={{
                                        ...file,
                                        type: fileFormat,
                                        link,
                                        id: postId
                                    }}
                                    listItemProps={{
                                        button: true,
                                    }}
                                    showActions
                                    downloadFile={downloadFile}
                                    onClick={() => onClick({fileFormat, link, ...file})}
                                />
                            </span>
                        )
                    })
                }
            </div>
            {
                state.file && 
                <Dialog fullWidth maxWidth={'lg'} open={!!state.file} onClose={() => setState({...state, file: null})}>
                    <DialogTitle>
                        {attached.find(({id}: any) => id === state.file.id)?.title}
                        <div style={{display: 'flex', alignItems: 'center', float: 'right', marginRight: 35, marginTop: -4}}>
                            <FilePreviewActions
                                item={state.file}
                                downloadFile={() => downloadFile(state.file)}
                            />
                        </div>
                    </DialogTitle>
                    <DialogContent style={{minHeight: 600}}>
                        <FileViewer
                            file={state.file}
                        />
                    </DialogContent>
                </Dialog>
            }
        </div>
    )
}
