import React from 'react'
import {TextField, Checkbox, FormControl, Select, Divider, Button, Collapse} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { DropzoneArea } from 'material-ui-dropzone';
import Tags from '../Shared/Tags/Tags';
import {Add} from '@material-ui/icons'
import store from '../../Store';
import SpaceAutocomplete from '../Space/SpaceAutocomplete';
import PostNotifications from '../Post/PostNotifications';
export default function ImageCreator(props) {
    const {passedState, isMod, parent, submitMediaPost, newPost, onPostChange} = props;
    const [state, setState] = React.useState({
        expandedOptions: false,
    })
    return (
        <div>
            <div style={{height: '100%'}}>
                <TextField
                    label="Title"
                    variant="outlined"
                    onChange={(e) => onPostChange({...newPost, title: e.target.value})}
                    value={newPost.title}
                    style={{width: '100%', marginTop: '10px'}}
                />
                <div style={{marginTop: '10px', height: '30vh'}}>
                    <DropzoneArea
                        acceptedFiles={['image/*']}
                        dropzoneText={"Drag and drop an image here or click"}
                        onChange={(files) => onPostChange({...newPost, files: files})}
                        filesLimit={10}
                    />  
                </div>
                            
            </div>
                            
            <div style={{marginTop: '10px'}}>
                <Divider/>
                <div  style={{marginTop: '10px', marginBottom: '10px', width: '100%'}}>
                <Tags tags={state.linkTags} onChange={(tags) => setState({...state, linkTags: tags})}/>
                </div>
                <div style={{marginTop: '10px', marginBottom: '10px'}}>
                <Collapse in={state.expandedOptions} mountOnEnter unmountOnExit>
                    {
                        isMod &&
                        <span>
                        <div onClick={() => onPostChange({...newPost, wiki: !newPost.wiki})} style={{cursor: 'pointer'}}>
                        <Checkbox checked={newPost.wiki ? newPost.wiki : false} /> Wiki
                        </div>
                        
                        <div onClick={() => onPostChange({...newPost, pinned: !state.pinned})} style={{cursor: 'pointer'}}>
                        <Checkbox checked={newPost.pinned ? newPost.pinned : false} /> Pinned
                        </div> 
                        </span>
                    }
                    <SpaceAutocomplete 
                        defaultValue={state.spaces} 
                        onChange={(spaces) => {onPostChange({...state, spaces: spaces})}}
                    />
                    
                </Collapse>
                    <div style={{display: 'flex', width: '100%', justifyContent: 'center', marginTop: 10}}>
                        <Button onClick={() => {onPostChange({...state, expandedOptions: !state.expandedOptions})}} style={{width: '100%'}}>
                            {state.expandedOptions ? <React.Fragment><ExpandLess/> Less Options</React.Fragment> : <React.Fragment><ExpandMore/> More Options</React.Fragment>}
                        </Button>
                    </div>
                </div>
                
                <Divider/>
            </div>
        </div>
    )
}
