import React from 'react';
import { getImage } from '../../actions/S3Actions';
import FilePreview from './FilePreview';
export default function MessageFiles(props) {
    const {message, deleteFile, width} = props;
    const [state, setState] = React.useState({
        files: [],
    })

    React.useEffect(() => {
        if (message.files) {            
            setState({
                ...state,
                files: message.files.map(f => {
                    if (f.type.includes('image')) {
                        return {...f, url: getImage(f.url), type: 'image'}
                    } else {
                        return {...f, type: 'file'}
                    }
                })
            });
        }
    }, [message]);

    const downloadFile = async (f) => {
        let link=document.createElement('a');
        link.href=getImage(f.url);
        link.download=f.name;
        link.target="_blank";
        link.rel="noopener noreferrer";
        link.click();
    }

    return (
        <div>
            <div style={{display: 'flex'}}>
                {
                    state.files.map((f, i) => (
                        <div style={{marginBottom: 10, width: '27%'}}>
                            <FilePreview
                                file={f}
                                created
                                size={'100%'}
                                deleteFile={() => deleteFile(i)}
                                width={width}
                                downloadFile={() => downloadFile(f)}
                            />
                        </div>
                            
                    ))
                }
            </div>
        </div>
    )
}
