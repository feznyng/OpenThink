import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ListItemText, Menu, MenuItem } from '@material-ui/core';
import { CloudDownload, CloudDownloadOutlined, MoreVert } from '@material-ui/icons';
import { DriveFileRenameOutline } from '@mui/icons-material';
import { useState } from 'react';
import commitUpdatePost from '../../mutations/UpdatePost';
import { Anchor } from '../Post/PostContentEditor';
import Button from '../Shared/Button';
import TextField from '../Shared/TextField';
import { FilePreviewItem } from './FilePreview';

const menuActions = [
    {
        name: 'Download',
        icon: <CloudDownloadOutlined/>
    },
    {
        name: 'Rename',
        icon: <DriveFileRenameOutline/>
    }
]

interface FilePreviewActionsProps {
    item: FilePreviewItem,
    downloadFile: () => void
}

interface FilePreviewActionsState {
    anchorEl: Anchor,
    open: boolean,
    editedName: string,
    saving?: boolean
}

export default function FilePreviewActions({item, downloadFile}: FilePreviewActionsProps) {
    const [state, setState] = useState<FilePreviewActionsState>({
        anchorEl: null,
        open: false,
        editedName: item?.title
    })

    const menuAction = (name: string) => {
        switch(name) {
            case 'Download':
                downloadFile()
                closeMenu()
                break
            case 'Rename':
                setState({...state, open: true, anchorEl: null})
                break
        }
    }

    const closeMenu = () => setState({...state, anchorEl: null})

    const saveName = () => {
        setState({
            ...state,
            saving: true
        })
        commitUpdatePost(
            {
                type: "File",
                postId: item.id,
                title: state.editedName
            },
            {
                onCompleted: () => {
                    setState({
                        ...state,
                        saving: false,
                        open: false
                    })
                },
                onError: () => [
                    setState({
                        ...state,
                        saving: false,
                        open: false
                    })
                ]
            }
        )
    }

    return (
        <div>
            <IconButton 
                size="small"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setState({...state, anchorEl: e.currentTarget})
                }}
            >
                <MoreVert/>
            </IconButton>
            <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={closeMenu}>
                {
                    menuActions.map(({name, icon}) => (
                        <MenuItem
                            onClick={() => menuAction(name)}
                        >
                            {icon}
                            <ListItemText
                                primary={name}
                                style={{marginLeft: 15}}
                            />
                        </MenuItem>
                    ))
                }
            </Menu>
            <Dialog open={state.open} onClose={() => setState({...state, open: false})}>
                <DialogTitle>
                    Rename File
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a new name for the item:
                    </DialogContentText>
                    <TextField
                        value={state.editedName}
                        fullWidth
                        onChange={(e) => setState({...state, editedName: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setState({...state, editedName: item.title, open: false})}
                    >
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        variant="contained"
                        loading={state.saving}
                        onClick={saveName}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
