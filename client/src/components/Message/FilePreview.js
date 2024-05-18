import { Badge, Card, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography } from '@material-ui/core';
import { Close, CloudDownload, Delete, FileCopy } from '@material-ui/icons';
import React from 'react';

export default function FilePreview(props) {
    const {file, deleteFile, downloadFile, created, size, width} = props;
    const [state, setState] = React.useState({
        src: null,
        hover: false,
        loading: true,
        viewImage: false
    });
    React.useEffect(() => { 
        if (!created) {
            if (file.type && file.type.includes('image')) {
                try {
                    const reader = new FileReader();
                    reader.addEventListener('load', () =>{
                        setState({
                            ...state, 
                            src: reader.result,
                            loading: false,
                        });
                    });
                    reader.readAsDataURL(file);
                } catch (e) {

                }
                
            } else {
                setState({
                    ...state,
                    loading: false,
                })
            }
        } else {
            setState({
                ...state, 
                loading: false,
                src: file.type === 'image' ? file.url : null
            });
        }   
    }, [file])
    
    
    return (
        <div onMouseEnter={() => setState({...state, hover: true})} onMouseLeave={() => setState({...state, hover: false})} style={{height: '100%'}}>
            {
                state.loading ? 
                <Card style={{display: 'flex', height: size, width: size, alignItems: 'center', justifyContent: 'center', padding: 10}}>
                    <CircularProgress/>
                </Card>
                :
                <Badge
                    badgeContent={
                        state.hover &&
                        <React.Fragment>
                            {
                                !created ? 
                                <IconButton
                                onClick={() => deleteFile(file)}
                                style={{backgroundColor: 'lightgrey', padding: 5}}
                                >
                                    <Delete style={{fontSize: 15, color: 'black', marginBottom: 0.5}}/>
                                </IconButton>
                                :
                                <Card>
                                    <IconButton
                                    onClick={() => downloadFile(file)}
                                    >
                                        <CloudDownload style={{fontSize: 20, color: 'black', marginBottom: 0.5}}/>
                                    </IconButton>
                                    <IconButton
                                    onClick={() => deleteFile(file)}
                                    >
                                        <Delete style={{fontSize: 20, color: 'black', marginBottom: 0.5}}/>
                                    </IconButton>
                                </Card>
                            }
                        </React.Fragment>
                    }
                >
                    <div>
                        {
                            !state.src &&
                            <Card style={{display: 'flex', height: size, alignItems: 'center', padding: 10, cursor: created ? 'pointer' : ''}} onClick={() => created && downloadFile(file)}>
                                <Typography variant="h6" style={{marginRight: 10}}>{file.name.substring(0, 10) + (file.name.length > 10 ? '...' : '')}</Typography>
                                <FileCopy style={{fontSize: 60}}/>
                            </Card>
                        }
                        {
                            state.src &&
                            <img onClick={() => setState({...state, viewImage: true})} style={{height: size, width: size, objectFit: 'cover'}} alt="" src={state.src}/>
                        }
                    </div>
                </Badge>

            }
            <Dialog maxWidth={'lg'} fullWidth fullScreen={width === 'xs' || width === 'sm'} open={state.viewImage} onClose={() => setState({...state, viewImage: false})}>
                <DialogTitle>
                    <div style={{float: 'left'}}>
                    {file.name}
                    </div>
                    <div style={{float: 'right', display: 'flex', marginTop: -10}}>
                    <IconButton
                        onClick={() => downloadFile(file)}
                        >
                            <CloudDownload style={{fontSize: 20, color: 'black', marginBottom: 0.5}}/>
                    </IconButton>
                    <IconButton
                        onClick={() => {setState({...state, viewImage: false}); deleteFile(file)}}
                    >
                        <Delete style={{fontSize: 20, color: 'black', marginBottom: 0.5}}/>
                    </IconButton>
                    <Divider flexItem orientation={'vertical'} style={{marginLeft: 2, marginRight: 2}}/>
                    <IconButton
                        onClick={() => setState({...state, viewImage: false})}
                        style={{marginLeft: 5}}
                    >
                        <Close style={{fontSize: 20, color: 'black', marginBottom: 0.5}}/>
                    </IconButton>
                    </div>
                   
                </DialogTitle>
                <DialogContent style={{display: 'flex', justifyContent: 'center'}}>
                    <img style={{width: '80%'}} alt="" src={state.src}/>
                </DialogContent>
            </Dialog>
        </div>
    )
}
