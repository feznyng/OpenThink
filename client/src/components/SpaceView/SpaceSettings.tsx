import { Card, DialogActions, DialogContent, Fade, IconButton } from '@material-ui/core';
import { Close, Done, Edit } from '@material-ui/icons';
import { DialogTitle } from '@mui/material';
import graphql from 'babel-plugin-relay/macro';
import React, { Fragment } from 'react';
import { useFragment, useLazyLoadQuery, useMutation } from 'react-relay';
import { useHistory } from 'react-router';
import { changeImage, deleteImage } from '../../actions/S3Actions';
import { primaryColor } from '../../theme';
import ImageResizer from '../Image/ImageResizer';
import BannerImage from '../Shared/BannerImageOld';
import Button from '../Shared/Button';
import Dialog from '../Shared/Dialog';
import LocationSearchInput from '../Shared/LocationSearchInput';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import { SimpleDialog } from '../Shared/SimpleDialog';
import TextField from '../Shared/TextField';
import Typography from '../Shared/Typography';
import Rules from '../Space/Rules';
import SpaceIcon from '../Space/SpaceIcon';
import { SpaceSettingsArchiveMutation } from './__generated__/SpaceSettingsArchiveMutation.graphql';
import { SpaceSettingsFragment$key } from './__generated__/SpaceSettingsFragment.graphql';
import { UpdateSpaceInput } from './__generated__/SpaceSettingsMutation.graphql';
import { SpaceSettingsQuery } from './__generated__/SpaceSettingsQuery.graphql';

interface SpaceSettingsProps {
    spaceId: number,
    fetchKey: any
}

interface SpaceSettings {
    name?: string | null
    description: string | null
    profilepic: string | null
    bannerpic: string | null
    rules: {
        name: string,
        description: string
    }[]
    latitude: number
    longitude: number
    address: string
}

interface SpaceSettingsState {
    space: any,
    imageOpen: boolean,
    imageType?: string,
    hoverBanner?: boolean,
    hoverIcon?: boolean,
    deletingSpace?: boolean,
    src?: any,
    changingImageType?: string | null
    openLeaving?: boolean,
    deleteText: string,
    selectedValue: string,
    croppedImage?: any
    changed?: boolean
}

export default function SpaceSettings({spaceId, fetchKey}: SpaceSettingsProps) {
    const {space} = useLazyLoadQuery<SpaceSettingsQuery>(
        graphql`
            query SpaceSettingsQuery($spaceId: Int!) {
                space(spaceId: $spaceId) {
                    name
                    ...SpaceSettingsFragment
                    permissions {
                        canEditSettings
                        canDeleteSpace
                    }
                }
            }
        `,
        {spaceId},
        {fetchKey}
    )

    const [commitUpdateSpace] = useMutation(
        graphql`
            mutation SpaceSettingsMutation($input: UpdateSpaceInput!) {
                updateSpace(input: $input) {
                    ...SpaceSettingsFragment
                }
            }
        `
    )

    const data = useFragment<SpaceSettingsFragment$key>(
        graphql`
            fragment SpaceSettingsFragment on Space {
                ...SpaceIconFragment
                spaceId
                name
                description
                profilepic
                bannerpic
                defaultBanner
                latitude
                project
                parentSpaceId
                longitude
                address
                rules {
                    name
                    description
                }

            }
        `,
        space
    )

    const [state, setState] = React.useState<SpaceSettingsState>({
        space: {
            ...data,
        },
        imageOpen: false,
        deleteText: '',
        selectedValue: ''
    })
    
    const history = useHistory()
    const iconInput = React.useRef();
    const bannerInput = React.useRef();

    const updateSpace = (input: Partial<UpdateSpaceInput>) => {
        commitUpdateSpace({
            variables: {
                input: {
                    ...input,
                    spaceId,
                }
            }
        })
    }

    const openImageDialog = (e: string) => {
        setState({
            ...state,
            imageOpen: true,
            imageType: e
        })
    }

    const openImageResizer = (type: string) => {
        let fileList;
        if (type === 'banner') {
            fileList = (bannerInput.current as any).files;

        } else {
            fileList = (iconInput.current as any).files;
        }
        if (fileList.length === 0) {
            return;
        }


        const file = fileList[0];
        const reader = new FileReader();
        reader.addEventListener('load', () =>
            setState({
                ...state, 
                src: reader.result,
                changingImageType: type
            })
        );
        reader.readAsDataURL(file);

    }

    const leaveProject = () => {
        // leave space
    }

    const changeCurrImage = () => {
        const file = state.croppedImage;
        let id = '';

        switch (file.type) {
            case 'image/png':
                id += '.png';
                break;
            case 'image/x-png':
                id += '.png';
                break;
            case 'image/jpeg':
                id += '.jpg'
                break;
            default: 
                return;
        }

        const imageURL = `spaces/${spaceId}/${state.changingImageType}${id}`;
        changeImage(imageURL, file).promise().then(e => {
            if (state.changingImageType === 'banner') {
                setState({
                    ...state,
                    src: null,
                    croppedImage: null,
                    space: {
                        ...state.space,
                        bannerpic: imageURL,
                    },
                });
                updateSpace({bannerpic: imageURL})
            } else {
                setState({
                    ...state,
                    src: null,
                    croppedImage: null,
                    space: {
                        ...state.space,
                        profilepic: imageURL,
                    }
                })
                updateSpace({profilepic: imageURL})
            }
        });
    }

    const saveSpace = () => {
        updateSpace({
            ...state.space
        })
        setState({
            ...state,
            changed: false
        })
    }

    const onClose = (e: any) => {
        switch (e) {
            case 'remove':
                if (state.imageType === 'Banner') {
                    deleteImage(state.space.bannerpic);
                    setState({
                        ...state,
                        space: {
                            ...state.space,
                            bannerpic: ''
                        },
                        imageOpen: false,
                    });
                    updateSpace({bannerpic: null})
                } else {
                    deleteImage(state.space.profilepic);

                    setState({
                        ...state,
                        space: {
                            ...state.space,
                            profilepic: '',
                        },
                        imageOpen: false,
                    });
                    updateSpace({profilepic: null})
                }
                break;
            case 'change':
                if (state.imageType === 'Banner') {
                    (bannerInput.current as any).click()
                } else {
                    (iconInput.current as any).click()
                }
                break
            case 'close':
                setState({
                    ...state,
                    imageOpen: false
                })
                break;
            default: 
                break;
        }
    }

    const [commitArchiveSpace] = useMutation<SpaceSettingsArchiveMutation>(
        graphql`
            mutation SpaceSettingsArchiveMutation($input: ArchiveSpaceInput!) {
                archiveSpace(input: $input) {
                    id
                    archived
                }
            }
        `
    )

    const deleteSpace = () => {
        commitArchiveSpace({
            variables: {
                input: {
                    spaceId
                }
            },
            onCompleted: () => {
                history.push('/')
            }
        })
    }

    const type = data?.project ? 'Project' : 'Group'

    return (
        <Dialog open fullScreen onClose={() => history.goBack()}>
            <DialogTitle>
                Settings
            </DialogTitle>
            <div style={{paddingBottom: 100}}>
            <MaxWidthWrapper width={900}>
            <Fragment>
                <div style={{position: 'relative'}}>
                    <div
                        onMouseEnter={() => setState({...state, hoverBanner: true, hoverIcon: false})}
                        onMouseLeave={() => setState({...state, hoverBanner: false})}        
                    >
                        <div onClick={() => openImageDialog('Banner')}>
                            <BannerImage
                                object={state.space}
                                style={{width:'100%', objectFit: 'cover', cursor: 'pointer', height: 250}} 
                            />
                        </div>
                        <div 
                            style={{
                                position:'absolute',
                                bottom: 10,
                                right: 10,
                                zIndex: 1000,
                                display: state.hoverBanner && !state.hoverIcon ? '' : 'none'
                            }}
                            onClick={() => openImageDialog('Banner')}
                        >
                            <div>
                                <Button variant="contained" color="primary" size="small">Change Banner</Button>
                            </div>
                        </div>
                    </div>
                    <div 
                        style={{
                            position:'absolute',
                            height: '100%', 
                            top: 0,
                            left: 20,
                            display: 'flex',
                            alignItems: 'center', 
                            cursor: 'pointer',
                        }}
                    >
                        <span
                            onClick={() => openImageDialog('Icon')}
                            onMouseEnter={() => setState({...state, hoverIcon: true})}
                            onMouseLeave={() => setState({...state, hoverIcon: false})}
                            style={{position: 'relative'}}
                        >
                            
                            <SpaceIcon
                                space={data}
                                size={100}
                            />
                        <IconButton size="small" style={{position: 'absolute', display: state.hoverIcon ? 'block' : 'none', top: -10, right: -10, backgroundColor: primaryColor}}>
                                <Edit/>
                            </IconButton>
                        </span>
                        
                    </div>
                </div>
                
                <div>
                    <TextField
                        label="Name"
                        fullWidth
                        value={state.space.name}
                        onChange={e =>  setState({...state, space: {...state.space, name: e.target.value}, changed: true})}
                        variant="outlined"
                        style={{marginTop: '20px'}}
                    />
                </div>
                <div>
                    <TextField
                        label="Description"
                        multiline
                        fullWidth
                        value={state.space.description}
                        onChange={e =>  setState({...state, space: {...state.space, description: e.target.value}, changed: true})}
                        variant="outlined"
                        style={{marginTop: '20px'}}
                    />
                </div>
                <Rules
                    editing
                    onChange={(rules: any) => setState({...state, space: {...state.space, rules}, changed: true})} 
                    parent={state.space}
                    canEdit
                />
                <div style={{marginTop: 10, textAlign: 'left'}}>
                    <Typography variant="h6" style={{marginTop: '10px'}} >Location</Typography>
                    <div style={{marginTop: 10}}>
                        <LocationSearchInput
                            style={{width: '100%'}} 
                            value={{
                                longitude: state.space.latitude,
                                latitude: state.space.longitude,
                                address: state.space.address,
                            }}
                            onLocationChange={location => setState({...state, space: {...state.space, ...location}, changed: true})}
                        />
                    </div>
                </div>
            </Fragment>
                <div style={{textAlign: 'left', marginTop: 10}}>
                    <Typography variant="h6" style={{marginTop: '10px', color: 'red'}} >Danger Zone</Typography>
                    <Button 
                        variant='outlined' 
                        style={{color: 'red', marginTop: 15}} 
                        onClick={() => 
                            setState({...state, deletingSpace: true})
                        }
                    >
                        Delete {type}
                    </Button>
                </div>
            </MaxWidthWrapper>
            <input onChange={() => openImageResizer('icon')} type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={iconInput as any} />
            <input onChange={() => openImageResizer('banner')} type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={bannerInput as any} />
            <Dialog open={!!state.openLeaving} onClose={() => setState({...state, openLeaving: false})}> 
                <DialogTitle>
                    Leave Project
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to leave? Another person has to invite you if you'd like to return.
                </DialogContent>
                <DialogActions>
                <IconButton
                    onClick={leaveProject}
                >
                        <Done/>
                    </IconButton>       
                    <IconButton onClick={() => setState({...state, openLeaving: false})}>
                        <Close/>
                    </IconButton>
                    
                </DialogActions>
            </Dialog>
            <SimpleDialog selectedValue={state.selectedValue} open={state.imageOpen} onClose={onClose} type={state.imageType}/>
            <Dialog 
                open={!!state.deletingSpace} 
                onClose={() => setState({...state, deletingSpace: false, deleteText: ''})}
            >
                <DialogTitle>
                    Delete {type}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                    Are you sure you want to delete this {type.toLocaleLowerCase()}? All posts, comments, projects, and subspaces will be deleted.
                    </Typography>

                    <Typography style={{marginTop: '10px'}}>
                    Please enter the name of this {type.toLocaleLowerCase()} below to confirm.
                    </Typography>
                    <TextField
                        style={{marginTop: '20px', width: '100%'}}
                        placeholder={state.space.name ? state.space.name : ''}
                        value={state.deleteText}
                        onChange={(e) => setState({...state, deleteText: e.target.value})}
                    />
                    <Button 
                        onClick={deleteSpace} 
                        disabled={state.deleteText !== space!!.name} 
                        variant="outlined" 
                        style={{color: state.deleteText !== space!!.name ? 'lightgrey' : 'red', float: 'right', marginTop: 10}}
                    >
                        Delete {type} Permanently
                    </Button>
                </DialogContent>
            </Dialog>
            <Dialog open={Boolean(state.src)} onClose={() => setState({...state, src: null, changingImageType: null, croppedImage: null})}>
                <DialogTitle>
                    Change {state.changingImageType} Image
                </DialogTitle>
                <DialogContent>
                <ImageResizer
                    src={state.src}
                    circularCrop={state.changingImageType === 'icon'}
                    aspect={state.changingImageType === 'icon' ? 1 : (3.6)}
                    onChange={(blob: any) => setState({...state, croppedImage: blob})}
                />
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setState({...state, src: null, croppedImage: null})}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={changeCurrImage} color="primary" style={{color: 'white'}}>
                        Set {state.changingImageType}
                    </Button>
                </DialogActions>
            </Dialog>
            <Fade
                in={state.changed}
            >
                <Card style={{position: 'fixed', bottom: 0, left: 10, paddingLeft: 15, paddingRight: 15, width: '100%', padding: 15}}>
                    <div style={{float: 'left'}}>
                        <Typography>
                            You have unsaved changes.
                        </Typography>
                    </div>
                    <div style={{float: 'right'}}>
                        <Button
                            color='primary'
                            onClick={saveSpace}
                            variant='contained'
                        >
                            Save
                        </Button>
                    </div>
                </Card>
            </Fade>
            </div>
        </Dialog>
    )
}
