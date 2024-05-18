import React, { Fragment, useState } from 'react';
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import {Button, Badge, Menu, MenuItem, Snackbar, withWidth, Dialog, DialogContent, DialogActions, Divider, DialogTitle, useMediaQuery,} from '@material-ui/core';
import {Reply, PhotoCamera, Settings, Close, ChatBubble, VisibilityOff, Public, MoreVert, Add, Edit} from '@material-ui/icons'
import { IconButton } from '@material-ui/core';
import { RootState } from '../../Store';
import {useDispatch, useSelector} from 'react-redux';
import BannerImage from '../Shared/BannerImage';
import UserIcon from './UserIcon'
import ConnectButton from './ConnectButton';
import { user } from '../../types/user';
import GeneralTabs, { TabObject } from '../Shared/GeneralTabs';
import { useHistory, useParams } from 'react-router';
import { changeImage, deleteImage } from '../../actions/S3Actions';
import { updateUser } from '../../actions/userActions';
import ImageResizer from '../Image/ImageResizer';
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import UserMessageButton from '../Message/UserMessageButton';

const tabs = [
  {
    title: 'About',
    value: 'about'
  },
  {
    title: 'Groups',
    default: true,
    value: ''
  },
  {
    title: 'Projects',
    value: 'projects'
  },
  {
    title: 'Connections',
    value: 'connections'
  },
]

interface ProfileHeaderProps {
  userData: any,
  meData: any,
  profile: boolean,
}

interface ProfileHeaderState {
  anchorEl: null | any,
  open: boolean,
  src: any,
  changingImageType: string | null,
  croppedImage?: any,
  imageType?: string,
  imageOpen?: boolean
}

interface ProfileHeaderParams {
  userPage: string | undefined, 
  userID: string | undefined
}

export default function ProfileHeader({profile, userData, meData}: ProfileHeaderProps) {
  const user = useFragment(    
      graphql`      
          fragment ProfileHeaderFragment_user on User {   
            userId
            firstname
            lastname
            bio
            ...ConnectButtonFragment_connection
            ...UserMessageButtonFragment_user
            ...BannerImageFragment
            ...UserIconFragment
          }
      `,    
      userData
  );

  const me = useFragment(    
      graphql`      
          fragment ProfileHeaderFragment_me on User {   
            userId
            ...UserMessageButtonFragment_me
          }
      `,    
      meData
  );

  const {
      mobile,
      userInfo,
  } = useSelector((state: RootState) => ({...state.userActions, ...state.uiActions}));

  const canEdit = me.userId === user.userId


  const [state, setState] = React.useState<ProfileHeaderState>({
      anchorEl: null,
      open: false,
      src: null,
      changingImageType: ''
  })
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    userPage,
    userID,
  } = useParams<ProfileHeaderParams>();

  const iconInput = React.useRef();
  const bannerInput = React.useRef();

  const openImageResizer = (type: string) => {
    let fileList;
    if (type === 'banner') {
        fileList =( bannerInput.current!! as any).files;

    } else {
        fileList = (iconInput.current!! as any).files;
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

    const imageURL = `users/${userInfo.user_id}/${state.changingImageType}/${id}`;
    changeImage(imageURL, file).promise().then(e => {
        if (state.changingImageType === 'banner') {
            setState({
                ...state,
                src: null,
                croppedImage: null,
            });

            dispatch(updateUser({...userInfo, bannerpic: imageURL}))
        } else {
            setState({
                ...state,
                src: null,
                croppedImage: null,
            });
            dispatch(updateUser({...userInfo, profilepic: imageURL}))
        }
    });
  }

  const onClose = (e: string) => {
    switch (e) {
        case 'remove':
            if (state.imageType === 'Banner') {
                deleteImage(userInfo.bannerpic);
                dispatch(updateUser({...userInfo, bannerpic: null}))
            } else {
                deleteImage(userInfo.profilepic);
                dispatch(updateUser({...userInfo, profilepic: null}))
            }
            setState({
              ...state,
              imageOpen: false
            })
            break;
        case 'change':
            if (state.imageType === 'Banner') {
                (bannerInput.current!! as any).click()
            } else {
                (iconInput.current!! as any).click()
            }
            setState({
              ...state,
              imageOpen: false
          })
            break;
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

  const openImageDialog = (e: string) => {
    setState({
        ...state,
        imageOpen: true,
        imageType: e
    })
  }
  const matches = useMediaQuery('(min-width:600px)');

  return (
      <div >
        <div >
          <div style={{position: 'relative', width: '100%'}}>
            <div 
              style={{display: 'flex', justifyContent: 'center', position: 'relative', cursor: 'pointer'}} 
              onClick={() => openImageDialog('Banner')}
            >
              <BannerImage
                data={user}
                style={{objectFit: 'cover', width: '100%', height: 250, borderEndStartRadius: 10, borderEndEndRadius: 10}} 
              />
              <Button
                variant="contained"
                disableElevation
                style={{textTransform: 'none', position: 'absolute', bottom: 15, right: 15}}
                startIcon={<PhotoCamera/>}
              >
                Add Cover Photo
              </Button>
            </div>
            <div 
              style={{
                  position:'absolute',
                  bottom: -30,
                  left: 20,
                  display: 'flex',
                  alignItems: 'center'
              }}
            >
              <div style={{position: 'relative', }} onClick={() => openImageDialog('Icon')}>
                <UserIcon 
                  user={user}
                  size={mobile ? 75 : 125}
                />
                {
                  canEdit &&
                  <IconButton
                    size="small"
                    style={{position: 'absolute', bottom: 0, right: 0, zIndex: 100}}
                  >
                    <Edit/>
                  </IconButton>
                }
                
              </div>
            </div>
          </div>
        
          <CardContent style={{textAlign: 'left', marginTop: 20}}>
            <div style={{position: 'relative'}}>
              <Typography gutterBottom variant="h4" style={{fontWeight: 'bold'}}>
                {user.firstname} {user.lastname}
              </Typography>
              <Typography>
                {user.bio}
              </Typography>
              <div style={{position: matches ? 'absolute' : undefined, marginTop: matches ? 0 : 10, top: 0, right: 0, display: 'flex', alignItems: 'center'}}>
                {
                  me?.userId !== user?.userId && 
                  <Fragment>
                  <UserMessageButton
                      userData={user}
                      meData={me}
                      style={{width: '100%', marginRight: 10}}
                      fullWidth
                  />
                   <ConnectButton
                      userData={user}
                      style={{width: '100%', marginRight: 10}}
                      fullWidth
                  />
                  </Fragment>
                }
                <IconButton 
                    onClick={(e) => 
                        setState({...state, anchorEl: e.currentTarget})
                    }
                >
                    <MoreVert/>
                </IconButton >
              </div>
            </div>
            <Menu open={Boolean(state.anchorEl)} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
              <MenuItem 
                onClick={() => {
                  setState({...state, anchorEl: null});
                  history.push('/settings')
                }}
              >
                Settings
              </MenuItem>
            </Menu>
            <Divider style={{marginTop: 10}}/>
          </CardContent>
          {
            tabs && 
            <div style={{display: 'flex', justifyContent: 'center', position: 'relative', marginTop: -10}}>
              <div style={{maxWidth: 900, width: "100%", marginLeft: 10, marginRight: 10, marginBottom: -23}}>
                <GeneralTabs
                  tabs={tabs}
                  onClick={(link: string) => profile ? history.replace(`/profile/${userID}/${link}`) : history.replace(`/account/${link}`)}
                  selected={userPage ? userPage : (tabs.find((t: TabObject) => t.default)!.value)}
                />
              </div>
            </div>
          }
          
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={state.open}
          autoHideDuration={2000}
          onClose={() => setState({...state, open: false})}
          message="Group URL copied to clipboard"
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={() => setState({...state, open: false})}>
                <Close fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />

      <Dialog onClose={() => setState({...state, imageOpen: false})} open={!!state.imageOpen}>
        <DialogTitle>Set {state.changingImageType} image</DialogTitle>
        <Button onClick={() => onClose('remove')}>Remove Image</Button>
        <Button onClick={() => onClose('change')}>Change Image</Button>
        <Button onClick={() => onClose('close')}>Close</Button>
      </Dialog>
      <Dialog open={Boolean(state.src)} onClose={() => setState({...state, src: null, changingImageType: null, croppedImage: null})}>
          <DialogTitle>
              Change {state.changingImageType} Image
          </DialogTitle>
          <DialogContent>
          <ImageResizer
              src={state.src}
              circularCrop={state.changingImageType === 'icon'}
              aspect={state.changingImageType === 'icon' ? 1 : (3.9)}
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
      <input onChange={() => openImageResizer('icon')} type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={iconInput as any} />
      <input onChange={() => openImageResizer('banner')} type="file" style={{width: 0, height: 0, visibility: 'hidden'}} ref={bannerInput as any} />
      </div>
  )
}
