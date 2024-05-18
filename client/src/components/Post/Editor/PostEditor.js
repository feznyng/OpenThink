import {
  Collapse, FormControl, MenuItem, Select, Typography, withWidth
} from '@material-ui/core';
import { ExpandLess, ExpandMore, People } from '@material-ui/icons';
import React, { Component } from 'react';
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import { getPostByID } from '../../../actions/postActions';
import { changeImage, getImage } from '../../../actions/S3Actions';
import { getTags } from '../../../actions/tagActions';
import { types } from '../../../utils/postutils';
import Button from '../../Shared/Button';
import Tags from '../../Shared/Tags/Tags';
import TextField from '../../Shared/TextField';
import SpaceAutocomplete from '../../Space/SpaceAutocomplete';
import PostIcon from '../PostIconOld';
import PostOptions from '../PostOptions';
import PostTipTap from './PostTipTap';

export class PostEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addPriority: false,
            addDate: false,
            addAssignees: false,
            titleFocused: false,
            selectingEndDate: false,
            addingPoll: false,
            pollBody: '',
            addLocation: false,
            start: true,
            editorExpanded: false,
        }
        this.parentType = this.props.parentType;
        this.parent = this.props.parent;
        this.titleRef = React.createRef();
        this.tags = [];
        getTags().then(tags => {this.tags = tags;});
        this.changeTitle = (title) => {
            this.props.onPostChange({
                ...this.props.newPost,
                title: title
            })
        }

        this.changeBody = (body) => {
            this.props.onPostChange({
                ...this.props.newPost,
                body: body
            })
        }
        this.imageHandler = () => {
            var input = document.createElement('input');
            input.type = 'file';
            input.onchange = this.imageChanges
            input.click();
        }

        this.imageHandler2 = (imageDataUrl, imageType) => {
            this.imageChanges(true, imageDataUrl, imageType)
        }

        this.imageChanges = (e, imageDataUrl, imageType) => {
            let file;
            if (imageDataUrl) {
                file = this.dataURItoBlob(imageDataUrl, imageType)
            } else {
                const fileList = e.target.files;
                if (fileList.length === 0) {
                    return;
                }
                
            }
            
            let id = uuidv4();

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
            let imageURL = `${this.parentType}/${uuidv4()}/posts/${uuidv4()}/images/${id}`;

            changeImage(imageURL, file).promise().then(e => {
                const range = this.editor.getSelection();
                const signedURL = getImage(imageURL);
                this.editor.insertEmbed(range.index, 'image', signedURL, 'user');
                this.props.imageChange(signedURL, imageURL)
            });
        }

        const bindings = {
            enter: {
              key: 13,
              shiftKey: true,
              handler: () => {
                if (this.props.newPost.title !== '') {
                    this.props.finish()
                }
              }
            }
          };
        this.expandOptions = () => {
            this.setState({
                ...this.state,
                start: !this.state.start
            })
        }
    }   

    render() {
        return (
            <div 
                style={{textAlign: 'left'}} 
            >
                <form noValidate>
                    <div >

                        <div style={{marginBottom: this.props.width === 'xs' || this.props.width === 'sm' ? '60px' : '20px'}}>
                            <div style={{marginLeft: 3}}>
                                {
                                    !this.props.hideSelector && 
                                    <FormControl 
                                        variant={this.props.fullscreen ? "standard" : 'outlined'} 
                                        style={{
                                            marginBottom: 20,
                                        }} 
                                        disabled={this.props.lockedType}
                                    >
                                    
                                        <Select
                                        value={this.props.newPost.type}
                                        onChange={(e) => {
                                            this.props.onPostChange({...this.props.newPost, type: e.target.value});
                                        }}
                                        disabled={this.props.lockedType}
                                        style={{height: '50px'}}
                                        renderValue={ (value) => 
                                            <MenuItem  value={value} style={{display: 'block'}}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <PostIcon post={{type: value}} />
                                                    <div style={{marginLeft: '10px '}}>{value}</div>
                                                </div>
                                            </MenuItem>
                                        }
                                        >   
                                        {
                                            types.filter(e => e.type !== 'Action Item').map(e => 
                                                
                                                <MenuItem key={e.type} value={e.type}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <PostIcon post={e} />
                                                        <div style={{marginLeft: '10px '}}>{e.type}</div>
                                                    </div>
                                                    <div>
                                                        <Typography>
                                                            {e.hint}
                                                        </Typography>
                                                    </div>
                                                </MenuItem>
                                            )
                                        }
                                        </Select>
                                    </FormControl>  
                                }
                                
                                <div onKeyPress={(e) => (e.key === 'Enter') && (this.props.newPost.title !== '' && this.props.finish(true))} variant="outlined" style={{width: '100%'}}>
                                    <TextField
                                        type='text'
                                        value={this.props.newPost.title}
                                        onChange={e => this.changeTitle(e.target.value)}
                                        placeholder={types.find(e => e.type === this.props.newPost.type).tip}
                                        autoFocus
                                        multiline
                                        style={{width: '100%', marginLeft: -5, }}
                                        ref={this.titleRef}
                                        onFocus={(e) => this.setState({...this.state, titleFocused: true})}
                                        onBlur={(e) => this.setState({...this.state, titleFocused: false})}
                                        InputProps={{
                                            style: {fontSize: 25, fontWeight: 'bolder', paddingLeft: 10},
                                            autoFocus: true 
                                        }}
                                        size="small"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div 
                        onClick={() => this.focusEditor()} 
                        onDrop={(e) => e.preventDefault()}
                        style={{marginTop: this.props.width === 'xs' || this.props.width === 'sm' ? -50 : -10, position: 'relative'}}
                    >
                    <PostTipTap
                        post={this.props.newPost}
                        onContentChange={(delta) => 
                            this.props.onPostChange({
                                ...this.props.newPost,
                                delta
                            })
                        }
                        variant="outlined"
                        getUsers={(query) => this.props.currSpace.users.filter(item => (`${item.firstname} ${item.lastname}`).toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)}
                        getPosts={(query) => this.props.currSpace.posts.filter(item => (item.title).toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)}
                        getTags={(query) => this.tags.filter(item => (item.info).toLowerCase().startsWith(query.toLowerCase())).slice(0, 15)}
                        focusEditor={func => this.focusEditor = func}
                        imageChange={this.props.imageChange}
                        finish={this.props.finish}
                        minHeight={this.props.fullscreen ? '20vh' : 100}
                    />
                    </div>
                    
                </form>                                        

                 <div>
                    <PostOptions
                        parent={this.props.parent} 
                        newPost={this.props.newPost} 
                        onPostChange={this.props.onPostChange}
                    />
                    {
                        !this.props.focused && 
                        <div>
                            <div  style={{marginTop: 15, width: '100%', display: "flex", alignItems: 'center'}}>
                            <span  style={{marginRight: 12, width: 30, display: 'flex', justifyContent: 'center'}}>
                                <Typography variant="h6">#</Typography>
                            </span>
                            <Tags tags={this.props.newPost.tags} onChange={(tags) => this.props.onPostChange({...this.props.newPost, tags: tags})}/>
                            </div>
                        </div>
                    }
                    <Collapse  style={{marginTop: 10}} in={this.state.expandedOptions} mountOnEnter unmountOnExit>                       
                    <div  style={{width: '100%', display: "flex", alignItems: 'center'}}>
                        <span  style={{marginRight: 12, marginBottom: -1, width: 30, display: 'flex', justifyContent: 'center'}}>
                            <People/>
                        </span>
                        <SpaceAutocomplete 
                            defaultValue={this.props.newPost.spaces} 
                            onChange={(spaces) => this.props.onPostChange({...this.props.newPost, spaces: spaces})}
                            autoFocus
                        />
                    </div>
                    </Collapse>
                        <div style={{display: 'flex', width: '100%', justifyContent: 'center', marginTop: 10}}>
                            <Button 
                                onClick={() => {this.setState({...this.state, expandedOptions: !this.state.expandedOptions})}} 
                                fullWidth
                                startIcon={this.state.expandedOptions ? <ExpandLess/> : <ExpandMore/>}
                            >
                                {
                                    this.state.expandedOptions ? 
                                    <React.Fragment>Less Options</React.Fragment> 
                                    : 
                                    <React.Fragment>More Options</React.Fragment>
                                }
                            </Button>
                        </div>
                </div >
            </div>
        )
    }

    dataURItoBlob = (dataURI, imageType) => {
        const byteString = atob(dataURI.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const bb = new Blob([ab], { type: imageType });
        return bb;
    }
}

const mapStateToProps = (state) => {
    return {...state.orgActions};
  }
  
  const mapDispatchToProps = {
    getPostByID
  }
  
export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(PostEditor))
