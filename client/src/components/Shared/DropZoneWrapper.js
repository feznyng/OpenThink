import React from 'react';
import {useDropzone} from 'react-dropzone';
import {Backdrop, Card, CardContent, Typography} from '@material-ui/core';
import {FileCopy} from '@material-ui/icons'
export default function StyledDropzone(props) {
  const {children, onDrop} = props;
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop});
  
  return (
    <div {...props}>
      <div 
        {...getRootProps({isDragActive, isDragAccept, isDragReject, onClick: event => event.stopPropagation()})} 
        style={{...getRootProps(isDragActive, isDragAccept, isDragReject).style, ...props.style}}>
        <input {...getInputProps()} />
        {
            (isDragAccept || isDragAccept || 
            isDragReject) &&
            <Backdrop open={true} style={{zIndex: 1000}}>     
            <Card style={{zIndex: 2000, width: 500}}>
                <CardContent>
                    <FileCopy style={{fontSize: 200}}/>
                    <Typography variant="h4">Drag 'n' drop some files here, or click to select files</Typography>
                </CardContent>
            
            </Card>       
            </Backdrop>
        }
        {children}
      </div>
    </div>
  );
}

<StyledDropzone />