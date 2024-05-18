import { InsertDriveFile } from '@material-ui/icons';
import FileImage from './FileImage';
import { AiFillFileMarkdown, AiFillFilePdf } from 'react-icons/ai';
import { FaRust, FaJava } from 'react-icons/fa';
import { BsFillFileEarmarkCodeFill } from 'react-icons/bs';

import FileVideo from './FileVideo';

export default function FileIcon({file, type, name, link, size}: {file?: File, link?: string, name: string, type: string, size?: number}) {

    size = size ? size : 30

    const iconProps = {
        style: {width: size, height: size}
    }

    type = type && type.length > 0 ? type : file!!.type



    if (type.includes('image')) {
        return <FileImage file={file} link={link} size={size}/>
    }

    if (type.includes('video')) {
        return <FileVideo file={file} link={link} size={size}/>
    }

    let splits = type.split('/')
    type = ''
    if (splits.length > 1) {
        type = splits[1]
    } else {
        type = splits[0]
    }

    if (type.length === 0) {
        splits = name.split('.')
        if (splits.length > 1) {
            type = splits[1]
        }
    }
    switch(type) {
        case 'markdown':
            return <AiFillFileMarkdown {...iconProps}/>
        case 'rs':
            return <FaRust {...iconProps}/>
        case 'pdf':
            return <AiFillFilePdf {...iconProps}/>
        case 'json':
            return <BsFillFileEarmarkCodeFill {...iconProps}/>
        case 'java':
            return <FaJava {...iconProps}/>
    }

    return (
        <InsertDriveFile {...iconProps}/>
    )
}
