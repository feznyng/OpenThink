import { Button, ButtonGroup, ClickAwayListener, IconButton, Menu, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import { EmojiEmotions, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatStrikethrough, FormatUnderlined, Link as LinkIcon, TextFormat } from '@material-ui/icons';
import { useTheme } from '@material-ui/styles';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { changeImage } from '../../../actions/S3Actions';
import { primaryColor } from '../../../theme';
import './Editor.scss';
import EventHandler from './Extensions/AutoformatLink';
import Hashtag from './Extensions/Hashtag';
import Image from './Extensions/Image';
import Mention from './Extensions/Mention';

const PostTiptap = (props) => {
    const {post, onContentChange, style, readonly, variant, placeholder, focusEditor, finish, imageChange, minHeight, messages, onFileChange, getUsers, getPosts, getTags} = props;
    const container = React.useRef();
    const theme = useTheme();

    const [state, setState] = React.useState({
        focused: false,
        value: 0
    })
    const optionsRef = React.useRef();
    const [expanded, setExpanded] = React.useState(false);
    const delta = post.delta;

    const editor = useEditor({
        editable: !readonly,
        extensions: [
            StarterKit,
            Underline,
            Typography,
            Blockquote,
            TaskList,
            Image.configure({
                readonly: readonly
            }),
            TaskItem,
            Link,
            EventHandler.configure({
                onFileChange
            }),
            Mention(
                getUsers,
                getPosts,
            ),
            Hashtag(
                getTags
            ),
        ],
        content: (typeof(delta) === 'string' ? JSON.parse(delta) : delta) || post.body,
        onUpdate() {
            const json = this.getJSON();
            onContentChange(json)
        },
        editorProps: {
            handleKeyDown: (view, event) => {
                if (event.key === 'Enter' && event.shiftKey) {
                    finish();
                    return true;
                }

                return false
            }
        },
    });

    React.useEffect(() => {
        if (editor && readonly) {
            editor.commands.setContent(post.delta || post.body)
        }
    }, [post.delta])

    React.useEffect(() => {
        if (editor && focusEditor) {
            focusEditor(() => editor.commands.focus())
        }
    }, [editor])

    const imageUploadHandler = (url) => {
        if (url) {
            editor
                .commands.insertContent({
                    type: 'customImage',
                    attrs: {
                        url: state.url,
                        s3: false,
                    },
                })        
        } else {
          var input = document.createElement('input');
          input.type = 'file';
          input.onchange = (e) => {
            const file = e.target.files[0]
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
            let imageURL = `spaces/${uuidv4()}/posts/${uuidv4()}/images/${id}`;
    
            changeImage(imageURL, file).promise().then(e => {
                editor
                    .commands.insertContent({
                        type: 'customImage',
                        attrs: {
                            url: imageURL,
                            s3: true,
                        },
                    })
                });
                imageChange(imageURL, true)
          }
          input.click();
          
        }
        setState({
            ...state,
            anchorEl: null,
            imageMenu: false,
            url: '',
        })
    }

    return (
        <div 
            style={{...style, textAlign: 'left', border: variant === 'outlined' ? '' : 'none', borderWidth: state.focused ? 2 : 1, borderRadius: 5, borderColor: (state.hover || state.focused) ? (state.focused ? primaryColor : (theme.palette.type === 'dark' ? 'white' : 'black')) : 'transparent', padding: 10}} 
            ref={container}
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
            onFocus={() => setState({...state, focused: true})}
        >
          {
            editor && 
            <ClickAwayListener
                onClickAway={() => setState({...state, focused: false})}
            >
            <div style={{position: 'relative'}}>
                {!readonly && (!editor || editor.isEmpty) && <Typography onClick={() => editor.commands.focus()} style={{position: 'absolute', left: 0, top: 0}} color="textSecondary">{placeholder ? placeholder : 'Add Description'}</Typography>}
                <EditorContent editor={editor} style={{minHeight: readonly ? '' : minHeight}}/>
                {
                    !readonly && !messages && 
                    <div style={{marginLeft: -11, visibility: (variant !== 'outlined' || state.focused) ? 'visible' : 'hidden'}}
                        ref={optionsRef}
                    >
                        <ButtonGroup
                        >
                            {
                                /*
                                 <IconButton 
                                    onClick={(e) => setState({...state, anchorEl: e.currentTarget, imageMenu: true})}
                                    color={editor.isActive('customImage') && "primary"}
                                    size="small"
                                >
                                    <ImageIcon/>
                                </IconButton>
                                */
                            }
                           
                            <IconButton 
                                onClick={(e) => {
                                    if (editor.isActive('link')) {
                                        editor.chain().focus().unsetLink().run()
                                    } else {
                                        setState({...state, anchorEl: e.currentTarget, linkMenu: true});
                                    }
                                }}
                                size="small"
                                color={editor.isActive('link') && "primary"}
                            >
                                <LinkIcon/>
                            </IconButton>
                            <IconButton 
                                size="small"
                                onClick={(e) => setState({...state, anchorEl: e.currentTarget, emojiMenu: true})}
                                color={editor.isActive('emoji') && "primary"}
                            >
                                <EmojiEmotions/>
                            </IconButton>
                            <IconButton 
                                size="small"
                                onClick={() => {
                                    optionsRef.current.focus();
                                    setExpanded(!expanded);
                                    setState({...state, focused: true})
                                }}
                                onMouseDown={(e) => {
                                    
                                    e.preventDefault();
                                }}
                            >
                                <TextFormat/>
                            </IconButton>
                        </ButtonGroup>
                        {
                            expanded && 
                            <ButtonGroup style={{float: 'right'}}>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    color={editor.isActive('bulletList') && "primary"}
                                    size="small"
                                >
                                    <FormatListBulleted/>
                                </IconButton>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    color={editor.isActive('orderedList') && "primary"}
                                    size="small"
                                >
                                    <FormatListNumbered/>
                                </IconButton>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    color={editor.isActive('blockquote') && "primary"}
                                    size="small"
                                >
                                    <FormatQuote/>
                                </IconButton>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    color={editor.isActive('bold') && "primary"}
                                    size="small"
                                >
                                    <FormatBold/>
                                </IconButton>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    color={editor.isActive('italic') && "primary"}
                                    size="small"
                                >
                                    <FormatItalic/>
                                </IconButton>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    color={editor.isActive('underline') && "primary"}
                                    size="small"
                                >
                                    <FormatUnderlined/>
                                </IconButton>
                                <IconButton
                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                    color={editor.isActive('strike') && "primary"}
                                    size="small"
                                >
                                    <FormatStrikethrough/>
                                </IconButton>     
                            </ButtonGroup>   
                        }
                                    
                    </div>
                }

            </div>
            </ClickAwayListener>

          }
            <Menu 
                anchorEl={state.anchorEl} 
                open={Boolean(state.anchorEl)}
                onClose={() => setState({...state, anchorEl: null, imageMenu: false, linkMenu: false, emojiMenu: false})}
            >
                {
                    state.imageMenu &&
                    <div>
                    <Tabs
                        variant="scrollable" 
                        scrollButtons="auto" 
                        value={state.value} 
                        onChange={(event, newValue) => {
                            setState({...state, value: newValue});
                        }}
                    >
                        <Tab label="Upload"/>
                        <Tab  label="Link"/>
                    </Tabs>
                    {
                        state.value === 0 &&
                        <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20}}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => imageUploadHandler()}
                        >
                            Choose Image
                        </Button>
                        </div>
                    }
                    {
                        state.value === 1 &&
                        <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20}}>
                        <div>
                            <TextField
                            placeholder="Enter URL"
                            variant="outlined"
                            fullWidth
                            value={state.url}
                            autoFocus
                            onChange={(e) => setState({...state, url: e.target.value})}
                            />
                            <Button 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            onClick={() => imageUploadHandler(true)}
                            >
                                Embed Image
                            </Button>
                        </div>
                        </div>
                    }
                    </div>
                }
                {
                    state.linkMenu &&
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20}}>
                        <div>
                            <TextField
                            placeholder="Enter URL"
                            variant="outlined"
                            fullWidth
                            value={state.url}
                            autoFocus
                            onChange={(e) => setState({...state, url: e.target.value})}
                            />
                            <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => {
                                
                                editor.chain().focus().setLink({ href: state.url }).run()
                                setState({
                                    ...state, 
                                    url: '',
                                    anchorEl: null,
                                    linkMenu: false
                                })
                            }}
                            style={{marginTop: 10}}
                            fullWidth
                            >
                            Set Link
                            </Button>
                        </div>
                            
                    </div>
                }
                {
                    state.emojiMenu &&
                    <Picker
                        onSelect={(emoji) => {
                            editor.commands.insertContent(emoji.native)
                            setState({
                                ...state,
                                anchorEl: null,
                                emojiMenu: false
                            })
                        }}
                        showPreview={false}
                    />
                }
            
            </Menu>
            
        </div>
      )
}

export default PostTiptap