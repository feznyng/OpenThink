import React from 'react'
import { 
    Card, 
    CardContent, 
    CardHeader, 
    IconButton, 
    TextField, 
    Typography, 
    Dialog, 
    DialogTitle, 
    DialogContent,
    DialogActions,
    Box,
    Tabs,
    Tab,
    Divider,
    Button,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Checkbox,
    Collapse
} from '@material-ui/core';
import { Close, Add, ExpandLess, ExpandMore } from '@material-ui/icons';
import { ReactTinyLink } from 'react-tiny-link';
import Tags from '../../Shared/Tags/Tags';
import SpaceAutocomplete from '../../Space/SpaceAutocomplete';
import PostNotifications from '../PostNotifications';
import store from '../../../Store';

export default function LinkCreator(props) {
    const {isMod, validURL, baseURL, onPostChange, newPost} = props;
    const [state, setState] = React.useState({
        expandedOptions: false,
    })
    return (
        <div>
            <TextField
                label="Title"
                variant="outlined"
                onChange={(e) => {
                    onPostChange( {...newPost, title: e.target.value});
                }}
                value={newPost.title}
                style={{width: '100%', marginTop: '10px'}}
            />
            <TextField
                id="filled-password-input"
                label="Link"
                variant="outlined"
                onChange={(e) => onPostChange( {...newPost, link: e.target.value})}
                value={newPost.link}
                style={{width: '100%', marginTop: '10px'}}
            />
            
            <div style={{marginTop: '20px', marginLeft: '1px'}}>
                <Typography variant="h5">Preview</Typography>
                {
                    validURL(newPost.link) && 
                    <div style={{marginTop: '10px'}}>
                        <ReactTinyLink
                            cardSize="large"
                            showGraphic={true}
                            maxLine={2}
                            minLine={1}
                            proxyUrl={baseURL + 'proxy'}
                            url={newPost.link}
                        />
                    </div>
                }
                {
                    !validURL(newPost.link) && 
                    <Typography>Nothing yet.</Typography>
                }
            </div>                           
            <div style={{marginTop: '10px'}}>
                <Divider/>
                <div style={{marginTop: '10px', marginBottom: '10px', width: '100%'}}>
                    <Tags tags={newPost.tags} onChange={(tags) => onPostChange({...newPost, tags: tags})}/>
                </div>

                <div style={{marginTop: '10px', marginBottom: '10px'}}>
                    <Collapse in={state.expandedOptions} mountOnEnter unmountOnExit>
                        {
                            isMod &&
                            <span>
                            <div onClick={() => onPostChange({...newPost, wiki: !state.wiki})} style={{cursor: 'pointer'}}>
                            <Checkbox checked={newPost.wiki ? newPost.wiki : false} /> Wiki
                            </div>
                            
                            <div onClick={() => onPostChange({...newPost, pinned: !state.pinned})} style={{cursor: 'pointer'}}>
                            <Checkbox checked={newPost.pinned ? newPost.pinned : false} /> Pinned
                            </div> 
                            </span>
                        }
                        <SpaceAutocomplete 
                            defaultValue={state.spaces} 
                            onChange={(spaces) => {onPostChange({...newPost, spaces: spaces})}}
                        />
                        
                    </Collapse>
                    <div style={{display: 'flex', width: '100%', justifyContent: 'center', marginTop: 10}}>
                        <Button onClick={() => {setState({...state, expandedOptions: !state.expandedOptions})}} style={{width: '100%'}}>
                            {state.expandedOptions ? <React.Fragment><ExpandLess/> Less Options</React.Fragment> : <React.Fragment><ExpandMore/> More Options</React.Fragment>}
                        </Button>
                    </div>
                </div>
                <Divider/>
            </div>
        </div>
    )
}
