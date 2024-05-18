import React from 'react'
import { getImage, changeImage, deleteImage } from '../../../actions/S3Actions';
import {setGeneralSettings, deleteParent, deleteSpaceUser} from '../../../actions/orgActions';
import SpaceIcon from '../SpaceIconOld';
import { TextField, FormControl, Badge, InputLabel, OutlinedInput, withWidth, CardContent, Typography, DialogContent, DialogActions, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, ButtonGroup, Divider, CardActions, CircularProgress } from '@material-ui/core';
import {Edit, Done, Close, Add, Save, Link, GroupAdd} from '@material-ui/icons';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import {useHistory, withRouter} from 'react-router-dom'
import Button from '@material-ui/core/Button';
import {useDispatch, useSelector} from "react-redux";
import Rules from '../Rules';
import LocationSearchInput from '../../Shared/LocationSearchInputOld';
import ImageResizer from '../../Image/ImageResizer';
import SpaceVisbilityOptions from './SpaceVisbilityOptions';
import SpaceAccessOptions from './SpaceAccessOptions';
import BannerImage from '../../Shared/BannerImageOld';

function SimpleDialog(props) {
    const { onClose, selectedValue, open, type} = props;
  
    const handleClose = () => {
      onClose(selectedValue);
    };
  
    const handleListItemClick = (value) => {
        onClose(value);
    };
  
    return (
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Set {type} image</DialogTitle>
        <Button onClick={() => handleListItemClick('remove')}>Remove Image</Button>
        <Button onClick={() => handleListItemClick('change')}>Change Image</Button>
        <Button onClick={() => handleListItemClick('close')}>Close</Button>
      </Dialog>
    );
}

export default function SpaceGeneralSettings(props) {
    const [state, setState] = React.useState({
        hoverBanner: false,
        hoverIcon: false
    })
    const {
        currSpace,
        editedSpace,
        currUser,
        mobile
    } = useSelector(state => ({...state.orgActions, ...state.uiActions}));

    const {
        bannerpic,
        name,
        description
    } = editedSpace;

    const iconInput = React.useRef();
    const bannerInput = React.useRef();
    const dispatch = useDispatch();
    const history = useHistory();

    const openImageDialog = (e) => {
        setState({
            ...state,
            imageOpen: true,
            imageType: e
        })
    }

    const editFields = (editedSpace, field, edited) => {
        dispatch(setGeneralSettings(editedSpace, edited));
    }

    const leaveProject = () => {
        dispatch(deleteSpaceUser(currSpace.space_id, currUser)).then(() =>{
            // redirect to dashboard
        })
    }

    const openImageResizer = (type) => {
        let fileList;
        if (type === 'banner') {
            fileList = bannerInput.current.files;

        } else {
            fileList = iconInput.current.files;
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

    const changeCurrImage = () => {
        console.log('change image')
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

        const imageURL = `spaces/${currSpace.space_id}/${state.changingImageType}${id}`;
        changeImage(imageURL, file).promise().then(e => {
            console.log(state)
            if (state.changingImageType === 'banner') {
                setState({
                    ...state,
                    src: null,
                    croppedImage: null,
                });
                editFields({
                    ...editedSpace,
                    ...currSpace,
                    bannerpic: imageURL,
                    default_banner: true
                }, 'bannerpic', true);
            } else {
                setState({
                    ...state,
                    src: null,
                    croppedImage: null,
                });
                editFields({
                    ...editedSpace,
                    ...currSpace,
                    profilepic: imageURL,
                }, 'profilepic', true);
            }
            

        });
        
    }

    const onClose = (e) => {
        switch (e) {
            case 'remove':
                if (state.imageType === 'Banner') {
                    deleteImage(currSpace.bannerpic);
                    setState({
                        ...state,
                        space: {
                            ...currSpace,
                            bannerpic: ''
                        },
                        imageOpen: false,
                        unsavedChanges: true,
                        bannerPic: 'https://placeimg.com/1000/300/nature'
                    });
                } else {
                    deleteImage(currSpace.profilepic);

                    setState({
                        ...state,
                        space: {
                            ...currSpace,
                            profilepic: '',
                            unsavedChanges: true,
                        },

                        imageOpen: false,
                        unsavedChanges: true,
                    });
                }
                break;
            case 'change':
                if (state.imageType === 'Banner') {
                    bannerInput.current.click()
                } else {
                    iconInput.current.click()
                }
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


    return (
        <div>
            <div style={{textAlign: 'left'}}>
                <CardContent>
                    <Divider/>
                        <Typography variant="h6" style={{marginTop: '10px'}}>Basic</Typography>
                    <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                    <div style={{position: 'relative'}}>
                        <div
                            onMouseEnter={() => setState({...state, hoverBanner: true, hoverIcon: false})}
                            onMouseLeave={() => setState({...state, hoverBanner: false})}        
                        >
                            <div onClick={() => openImageDialog('Banner')}>
                                <BannerImage
                                    object={editedSpace}
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
                            >
                                <Badge
                                    badgeContent={
                                        state.hoverIcon && 
                                        <IconButton style={{backgroundColor: '#2196f3', padding: 5, right: 10, top: 10}}
                                        ><Edit style={{color: 'black'}}/>
                                        </IconButton>
                                    }
                                >
                                <SpaceIcon 
                                    organization={editedSpace}
                                    size="100px" 
                                />
                                </Badge>
                            </span>
                        </div>
                    </div>
                    <div>
                        <TextField
                            label="Name"
                            fullWidth
                            value={name}
                            onChange={e =>  
                                editFields({
                                    ...editedSpace,
                                    name: e.target.value,
                                }, 'name', e.target.value !== currSpace.name)
                            }
                            variant="outlined"
                            style={{marginTop: '20px'}}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Description"
                            multiline
                            fullWidth
                            value={description}
                            onChange={e =>  
                                editFields({
                                    ...editedSpace,
                                    description: e.target.value,
                                }, 'description', e.target.value !== currSpace.description)
                            }
                            variant="outlined"
                            style={{marginTop: '20px'}}
                        />
                    </div>
                    <div style={{marginTop: 10, textAlign: 'left'}}>
                        <Rules 
                            editing
                            onChange={rules => 
                                editFields({
                                    ...editedSpace,
                                    rules,
                                }, 'rules', rules !== currSpace.rules)
                            } 
                            parent={editedSpace}
                            canEdit
                        />
                    </div>
                    <div style={{marginTop: 10, textAlign: 'left'}}>
                        <Divider style={{marginTop: '20px'}}/>
                        <Typography variant="h6" style={{marginTop: '10px'}} >Location</Typography>
                        <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                        <div style={{marginTop: 10}}>
                            <LocationSearchInput 
                                style={{width: '100%'}} 
                                defaultValue={currSpace.address}
                                longitude={currSpace.longitude}
                                latitude={currSpace.latitude}
                                onChange={({longitude, latitude, address}) => 
                                    editFields({
                                        ...editedSpace,
                                        longitude,
                                        latitude,
                                        address
                                    }, 'location', (longitude !== currSpace.longitude || latitude !== currSpace.latitude || address !== currSpace.address))
                                }
                            />
                        </div>
                    </div>
                    {
                        /*
                        <Divider style={{marginTop: 20}}/>
                        <Typography variant="h6" style={{marginTop: '10px'}}>Member Visbility</Typography>
                        <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                        <div style={{position: 'relative'}}>
                            <SpaceVisbilityOptions
                                currVisibility={editedSpace.type}
                                changeOption={(option) => editFields({
                                    ...editedSpace,
                                    type: option
                                })}
                            />
                        </div>
                        <Divider style={{marginTop: 20}}/>
                            <Typography variant="h6" style={{marginTop: '10px'}}>Member Access</Typography>
                        <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                        <div style={{position: 'relative'}}>
                            <SpaceAccessOptions
                                currAccess={editedSpace.access_type}
                                changeOption={(option) => editFields({
                                    ...editedSpace,
                                    access_type: option,
                                    require_request_answers: option === 'Restricted'
                                })}
                                questions={editedSpace.access_questions}
                                questionContext={editedSpace.user_request_description}
                                questionContextChange={user_request_description =>
                                    editFields({
                                        ...editedSpace,
                                        user_request_description
                                    })
                                }
                                answersRequired={!!editedSpace.require_request_answers}
                                toggleQuestions={(option) => editFields({
                                    ...editedSpace,
                                    access_type: (!editedSpace.require_request_answers) ? 'Restricted' : editedSpace.access_type,
                                    require_request_answers: !editedSpace.require_request_answers
                                })}
                                questionChange={(access_questions) => {
                                    
                                    if (access_questions[access_questions.length - 1].value.length !== 0) {
                                        access_questions.push({id: access_questions.length, value: ''})
                                    }
                                    editFields({
                                        ...editedSpace,
                                        access_questions
                                    });
                                }}
                            />
                        </div>
                        <Divider style={{marginTop: 20}}/>
                            <Typography variant="h6" style={{marginTop: '10px'}} >Prerequisite Groups</Typography>
                        <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                        <Divider style={{marginTop: 20}}/>
                            <Typography variant="h6" style={{marginTop: '10px'}} >Relevant Skills and Interests</Typography>
                        <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                        <Divider style={{marginTop: 20}}/>
                            <Typography variant="h6" style={{marginTop: '10px'}} >Group Access Questions</Typography>
                        <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                        */
                    }
                    {
                        currUser.type === 'Creator' && 
                        <div style={{textAlign: 'left', marginTop: 10}}>
                            <Divider/>
                                <Typography variant="h6" style={{marginTop: '10px', color: 'red'}} >Danger Zone</Typography>
                            <Divider style={{marginBottom: '20px', marginTop: '10px'}}/>
                            <ButtonGroup>
                                <Button 
                                    variant='outlined' 
                                    style={{color: 'red'}} 
                                    onClick={() => 
                                        setState({...state, deletingSpace: true})
                                    }
                                >
                                    Delete Group
                                </Button>
                            </ButtonGroup>
                        </div>
                    }
                </CardContent>
                <input onChange={() => openImageResizer('icon')} type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={iconInput} />
                <input onChange={() => openImageResizer('banner')} type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={bannerInput} />
            </div>
            <Dialog open={state.openLeaving} onClose={() => setState({...state, openLeaving: false})}> 
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
                fullScreen={mobile}
                open={state.deletingSpace} 
                onClose={() => setState({...state, deletingSpace: false, deleteText: ''})}
            >
                <DialogTitle>
                    Delete Space
                </DialogTitle>
                <DialogContent>
                    <Typography>
                    Are you sure you want to delete this space? All posts, comments, projects, and subspaces will be deleted.
                    </Typography>

                    <Typography style={{marginTop: '10px'}}>
                    Please enter the name of this space below to confirm.
                    </Typography>
                    <TextField
                        style={{marginTop: '20px', width: '100%'}}
                        placeholder={currSpace.name}
                        value={state.deleteText}
                        onChange={(e) => setState({...state, deleteText: e.target.value})}
                    />
                    <Button 
                        onClick={() => {
                                deleteParent(currSpace.space_id, 'spaces');
                                history.push('/dashboard')
                            }
                        } 
                        disabled={state.deleteText !== currSpace.name} 
                        variant="outlined" 
                        style={{color: state.deleteText !== currSpace.name ? 'lightgrey' : 'red', float: 'right', marginTop: '10px'}}
                    >
                        Delete Space Permanently
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
                    onChange={(blob) => setState({...state, croppedImage: blob})}
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
        </div>
    )
}
