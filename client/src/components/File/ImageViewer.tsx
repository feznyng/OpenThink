import React from 'react';

interface ImageViewerProps {
    link: string
}

export default function ImageViewer({link}: ImageViewerProps) {
    return (
        <div
            style={{width: '100%', height: '100%'}}
        >
            <img
                style={{width: '100%', height: '100%'}}
                src={link}
            />
        </div>
    )
}
