import React from 'react';
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import ImageViewer from './ImageViewer';
import CodeViewer from './CodeViewer'
import VideoPlayer from '../Video/VideoPlayer';
import { isValidHttpUrl } from '../../utils/urlutils';
import { getImage } from '../../actions/S3Actions';

interface FileViewerProps { 
    file: any
}

export default function FileViewer({file}: FileViewerProps) {
    const {fileFormat, link, postId, ...data} = useFragment(
        graphql`
            fragment FileViewerFragment on Post {
                fileFormat
                postId
                link
                ...CodeViewerFragment
            }
        `,
        file
    )

    if (fileFormat.includes('video')) {
        return (
            <VideoPlayer
                link={link}
                id={postId}
            />
        )
    }

    if (fileFormat.includes('image')) {
        return (
            <ImageViewer
                link={isValidHttpUrl(link) ? link : getImage(link)}
            />
        )
    }

    return (
        <div>
            <CodeViewer
                file={data}
            />
        </div>
    )
}
