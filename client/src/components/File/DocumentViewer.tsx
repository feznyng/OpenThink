import { useFragment } from 'react-relay';
import { getImage } from '../../actions/S3Actions';
import graphql from 'babel-plugin-relay/macro';

export const supportedFormats = [
    'doc',
    'docx',
    'htm',
    'html',
    'pdf',
    'ppt',
    'pptx',
    'xls',
    'xlsx'
]

interface DocumentViewerProps {
    file: any
}

export default function DocumentViewer({file}: DocumentViewerProps) {
    const {link, fileFormat} = useFragment(
        graphql`
            fragment DocumentViewerFragment on Post {
                link
                fileFormat
            }
        `,
        file
    )
      
    return (
        <div style={{height: '100%'}}>
            <object 
                data={getImage(link)} 
                type={fileFormat} style={{minHeight: 600, width: '100%'}}
            />
        </div>
    )
}
