import React from 'react';
import {Chip, Card, Divider, Button, Dialog, DialogTitle, DialogContent, IconButton, Icon, } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import store from '../../Store';
import SpacePreview from './SpacePreviewButton';
import PostPreview from '../Post/PostPreviewOld';
import FileSystem from '../Visualization/FileSystem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Check, Close, Done, Edit } from '@material-ui/icons';
import TextField from '../Shared/TextField';
import SpaceIcon from './SpaceIconOld';
import Typography from '../Shared/Typography';

function SpaceTag(props) {
  const {space, setState, state, readonly, removeParentPost, editable} = props;
  return (
    <div>
      <div style={{width: '100%', display: 'flex', justifyContent: 'center', justifyItems: 'center'}}>
        <SpacePreview simple s={space} expanded/>
      </div>
      {
        /* 
        !readonly && 
        <React.Fragment>
            {
              !space.parent_post && 
              <Divider style={{marginTop: '5px'}}/>
            }
            {
              space.parent_post && 
              <div>
                <span style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <ExpandMoreIcon style={{fontSize: 30, display: 'flex'}}/>
                </span>
                <span style={{width: '100%', display: 'flex', justifyContent: 'center', margin: 0, padding: 0}}>
                <PostPreview p={space.parent_post} color="white"/>
                <IconButton onClick={() => removeParentPost(space)} size="small">
                  <Close style={{fontSize: 18, margin: 1 }}/>
                </IconButton>
                <IconButton onClick={() => removeParentPost(space)} size="small">
                  <Edit style={{fontSize: 18, margin: 1 }}/>
                </IconButton> 
                </span>
                <Divider style={{marginTop: '5px', color: 'white'}}/>
              </div>
            }

          {
          !space.parent_post && editable && 
          <Button onClick={() => setState({...state, choosingSpaceParent: space})} size="small" style={{fontSize: 14, color: 'white'}}>
            Choose Post
          </Button>
          }
            
        </React.Fragment>
        */
      }
      
    </div>
    
  )
}



export default function SpaceAutocomplete(props) {
  const {defaultValue, onChange, chooseParentPost, inGroup, label, deleteSpace} = props;

  const [spaceArr, setSpaceArr] = React.useState([]);
  const [state, setState] = React.useState({
    choosingSpaceParent: null
  });
  React.useEffect(() => {
    setSpaceArr(defaultValue);
  }, [])
  
  return (
    <div style={{width: '100%'}}>
      <Autocomplete
        multiple
        onChange={(event, newspaceArr) => {
          if (event.key === 'Backspace' && spaceArr.length > 1) {
            onChange(spaceArr.slice(0, spaceArr.length - 1));
            setSpaceArr(spaceArr.slice(0, spaceArr.length - 1))
          } else {
            const newArr = [...defaultValue, ...newspaceArr.filter(s => !defaultValue.find(ds => ds.space_id === s.space_id))]
            setSpaceArr(newArr);
            onChange(newArr);
          }
          
        }}

        options={[...store.getState().userActions.userInfo.spaces].filter(s => !defaultValue.find(e => e.space_id === s.space_id))}
        getOptionLabel={(space) => space.name}
        value={spaceArr}
        renderOption={(space) => (<SpaceTag readonly space={space} />)}
        renderTags={(spaceArr, getTagProps) =>
          spaceArr.map((option, index) => {
            return (
              inGroup ? 
              <div style={{marginRight: 10}}>
                <SpacePreview simple s={option}/>
              </div>
              :
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                color={'primary'}
                size="large"
                icon={
                  <span
                    style={{marginLeft: 5}}
                  >
                    <SpaceIcon
                      organization={option}
                      size={30}
                    />
                  </span>
                }
                deleteIcon={getTagProps({ index }).deleteIcon}
                onDelete={
                  index === 0 ? 
                  undefined : 
                  () => {
                    onChange(spaceArr.filter((s, i) => i !== index));
                    setSpaceArr(spaceArr.filter((s, i) => i !== index))
                  }
                }
                style={{minHeight: 40}}
              />
            )
          })
        }
        disableClearable
        renderInput={(params) => (
          <TextField 
            {...params} 
            label={label} 
            placeholder={'Add more projects and groups...'}
            fullWidth
            size="small"
          />
        )}
      />
      <Dialog open={state.choosingSpaceParent} onClose={() => setState({...state, choosingSpaceParent: null})}>
          <DialogTitle>
              Choose Parent Post
          </DialogTitle>
          <DialogContent>
          <FileSystem parent={state.choosingSpaceParent} onSelect={(e) => {
              if (state.choosingSpaceParent.space_id) {
                  const space = spaceArr.find(s => s.space_id === state.choosingSpaceParent.space_id);
                  space.parent_post = e;
              } else {
                  const project = spaceArr.find(s => s.project_id === state.choosingSpaceParent.project_id);
                  project.parent_post = e;
              }
              setState({...state, choosingSpaceParent: null});
              onChange(spaceArr);
          }}/>
          </DialogContent>
      </Dialog>
    </div>
    
  );
}