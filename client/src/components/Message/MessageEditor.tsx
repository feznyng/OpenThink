import { Button, ButtonGroup, Card, Dialog, DialogActions, DialogContent, IconButton, Menu, Snackbar, TextField, Typography as Typ } from '@material-ui/core';
import { Close, Code, DeveloperMode, Done, EmojiEmotions, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatStrikethrough, Send, TextFormat } from '@material-ui/icons';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { CSSProperties } from 'react';
import Measure from 'react-measure';
import { useLazyLoadQuery } from 'react-relay';
import { mention, message } from '../../types/message';
import { sanitizeBody } from '../../utils/textprocessing';
import PasteListener from '../Post/Editor/Extensions/PasteListener';
import graphql from 'babel-plugin-relay/macro';
import './MessageEditor.scss';
import { MessageEditorQuery } from './__generated__/MessageEditorQuery.graphql';

const inputTags = ['textarea', 'input']

interface MessageEditorProps {
    onHeightChange?: (height: number) => void,
    sendMessage: (message: message) => void,
    message?: message,
    onFinish?: () => void,
    roomId?: number,
    canSend?: boolean,
    style?: CSSProperties,
    placeholder?: string,
    disableKeypressFocus?: boolean,
    autoFocus?: boolean
}


interface MessageEditorState {
    height: number,
    width: number,
    expanded: boolean,
    anchorEl: null | Element,
    body: string,
    limitReached: boolean,
    linkDialog: boolean,
    linkText: string,
    delta: any,
    editor: Editor | null,
    roomId?: number,
    updateFunc?: () => void
}

interface EditorState {
    body: string,
    delta: any,
}

export default function MessageEditor({ onHeightChange, sendMessage, disableKeypressFocus, autoFocus, placeholder, message, style, onFinish, canSend }: MessageEditorProps) {
    const { me } = useLazyLoadQuery<MessageEditorQuery>(
        graphql`
            query MessageEditorQuery {
                me {
                    firstname
                    userId
                    lastname
                    profilepic
                }
            }
        `,
        {}
    )

    const [state, setState] = React.useState<MessageEditorState>({
        width: 0,
        expanded: false,
        anchorEl: null,
        body: '',
        limitReached: false,
        linkDialog: false,
        linkText: '',
        delta: null,
        height: 50,
        editor: null
    })

    const [editorState, setEditorState] = React.useState<EditorState>({
        body: '',
        delta: null
    })

    const generateMessage = () => {
        const mentions: mention[] = [];
        if (editorState.delta && editorState.delta.content[0].content.length > 0) {
            editorState.delta.content[0].content.forEach((element: any) => {
                if (element.type === 'mention') {
                    mentions.push({user_id: element.attrs.id})
                }
            });
        }

        return {
            body: editorState.body,
            delta: editorState.delta,
            created_by: me?.userId,
            firstname: me?.firstname,
            lastname: me?.lastname,
            profilepic: me?.profilepic,
            created_at: new Date(),
            mentions,
        }
    }

    function submitMessage() {
        if (!canSend || (sanitizeBody(editorState.body).length === 0)) {
            return;
        }

        const message = generateMessage();
    
        sendMessage(message as any)
        setEditorState({
            body: '',
            delta: null
        });
        if (editor) {
            editor.commands.clearContent();
        }
            
    }

    const fileUploadHandler = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        
        input.onchange = (e) => {
            const newFiles = [...Array.from((e.target!! as any).files)];
        }
        input.click();
    }
    const OptionsMenu = (
        <ButtonGroup style={{display: 'flex', alignContent: 'flex-end', }}>
            <IconButton size="small" onClick={() => setState({...state, expanded: !state.expanded})}>
                <TextFormat style={{fontSize: 20, marginTop: 4}}/>
            </IconButton>
            <IconButton size="small" onClick={e => setState({...state, anchorEl: e.currentTarget})}>
                <EmojiEmotions style={{fontSize: 18}}/>
            </IconButton>
            <IconButton size="small" onClick={submitMessage}>
                <Send style={{fontSize: 18}}/>
            </IconButton>
        </ButtonGroup>
    )

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Blockquote,
            PasteListener.configure({
              onPaste: fileUploadHandler
            }),
            Link
        ],
        content: '',
        onUpdate() {
            const json = (this as any).getJSON()
            const html = (this as any).getHTML()
            setEditorState({body: html, delta: json});
        },
        editorProps: {
            handleKeyDown: (view, event: any) => {
                if (event.key === 'Enter') {
                    if (event.shiftKey) {
                        let event: any =  new Event("keydown");
                        event.keyCode = 13
                        event.key = event.code = 'Enter'
                        event.manualTrigger = true
                        view.someProp("handleKeyDown", f => f(view, event))
                        return true
                    } else {
                        return !event.manualTrigger;
                    }
                }
                return false
            },
        },
    })

    React.useEffect(() => {
        if (message && message.body && editor) {
            editor.commands.setContent(message.body!!)
            editor.commands.focus();
        }
    }, [message, editor])

    React.useEffect(() => {
        if (autoFocus) {
            editor?.commands.focus()
        }
    }, [editor])

    React.useEffect(() => {
        function onKeyPress(e: any) {
            if (disableKeypressFocus) {
                return;
            }
            if (e.altKey || e.ctrlKey || e.metaKey || !((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90))) {
                return
            }
            if (!document.activeElement?.className.includes('ProseMirror') && (!document.activeElement?.tagName || !inputTags.includes(document.activeElement.tagName.toLowerCase()))) {
                editor?.commands.insertContent(e.key)
                editor?.commands.focus(null, {scrollIntoView: false});
            }
            
        }
        document.addEventListener('keydown', onKeyPress)
        return () => {
            document.removeEventListener('keydown', onKeyPress)
        }
    }, [editor])

    return (
        <div
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey)
                    submitMessage();
            }}
            className="message-editor"
            style={{width: '100%'}}
        >
            <Measure
                bounds
                onResize={(contentRect: any) => {
                    onHeightChange && onHeightChange(contentRect.bounds.height);
                    setState({
                        ...state,
                        height: contentRect.bounds.height,
                        width: contentRect.bounds.width
                    })
                }}
            >
            {
                ({ measureRef }) => (
                    <Card style={{textAlign: 'left', maxWidth: '100%', paddingLeft: 0, boxShadow: 'none', border: 'solid', borderRadius: 15, borderWidth: 1, borderColor: 'grey', ...style}} ref={measureRef}>
                            <div style={{display: 'flex', width: '100%', height: '100%', float: 'left', maxHeight: 200, overflow: 'auto',}}>
                                <div style={{maxHeight: 300, width: '100%', marginLeft: 15}}> 
                                    {
                                        editor && 
                                        <div style={{position: 'relative', width: '100%'}}>
                                            {
                                                (!editor || editor.isEmpty) && 
                                                <Typ onClick={() => editor.commands.focus()} style={{position: 'absolute', left: 0, top: 11}} color="textSecondary">
                                                    {placeholder ? placeholder : "Send a Message..."}
                                                </Typ>
                                            }
                                            <EditorContent id="message-editor" editor={editor} style={{minHeight: 45, paddingTop: 12}}/>

                                            <div style={{float: 'right'}}>
                                                {
                                                    message && 
                                                    <span>
                                                        <IconButton onClick={submitMessage}>
                                                            <Done/>
                                                        </IconButton>
                                                        <IconButton onClick={onFinish}>
                                                            <Close/>
                                                        </IconButton>
                                                    </span>
                                                }
                                                
                                            </div>
                                        </div>
                                    }
                                </div>
                                
                                {
                                    !message && !state.expanded &&
                                    <div style={{marginLeft: 15, marginRight: 10, maxHeight: state.height, display: 'flex', alignContent: 'center'}}>
                                        {OptionsMenu}   
                                    </div>
                                }
                            </div>
                            {
                                editor && state.expanded && 
                                <div style={{paddingLeft: 5, paddingRight: 10,}}>
                                    <ButtonGroup style={{float: 'left', marginTop: 5}}>
                                        <IconButton
                                            size="small"
                                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                            color={editor.isActive('blockquote') ? "primary" : undefined}
                                        >
                                            <FormatQuote style={{fontSize: 18}}/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => editor.chain().focus().toggleBold().run()}
                                            color={editor.isActive('bold') ? "primary" : undefined}
                                        >
                                            <FormatBold style={{fontSize: 18}}/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => editor.chain().focus().toggleItalic().run()}
                                            color={editor.isActive('italic') ? "primary" : undefined}
                                        >
                                            <FormatItalic style={{fontSize: 18}}/>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => editor.chain().focus().toggleStrike().run()}
                                            color={editor.isActive('strike') ? "primary" : undefined}
                                            size="small"
                                        >
                                            <FormatStrikethrough style={{fontSize: 18}}/>
                                        </IconButton>     
                                        <IconButton
                                            onClick={() => editor.chain().focus().toggleCode().run()}
                                            color={editor.isActive('code') ? "primary" : undefined}
                                            size="small"
                                        >
                                            <Code style={{fontSize: 18}}/>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                            color={editor.isActive('codeblock') ? "primary" : undefined}
                                            size="small"
                                        >
                                            <DeveloperMode style={{fontSize: 18}}/>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                                            color={editor.isActive('bulletList') ? "primary" : undefined}
                                            size="small"
                                        >
                                            <FormatListBulleted style={{fontSize: 18}}/>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                            color={editor.isActive('orderedList') ? "primary" : undefined}
                                            size="small"
                                        >
                                            <FormatListNumbered style={{fontSize: 18}}/>
                                        </IconButton>
                                    </ButtonGroup>
                                    
                                    <div style={{float: "right", marginTop: 0}}>
                                        {OptionsMenu}
                                    </div>
                                </div>
                            }
                            <Menu 
                                anchorEl={state.anchorEl} 
                                open={Boolean(state.anchorEl)}
                                onClose={() => setState({...state, anchorEl: null})}
                            >
                                <Picker
                                    onSelect={(emoji) => {
                                        editor!!.commands.insertContent((emoji as any).native);
                                        setState({
                                            ...state,
                                            anchorEl: null,
                                            body: editor!!.getHTML()
                                        });
                                    }}
                                    showPreview={false}
                                />            
                            </Menu>
                            <Snackbar
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                open={state.limitReached}
                                autoHideDuration={6000}
                                onClose={() => setState({...state, limitReached: false})}
                                message="You can only upload 10 files at a time"
                                action={
                                    <React.Fragment>
                                        <IconButton size="small" aria-label="close" color="inherit" onClick={() => setState({...state, limitReached: false})}>
                                        <Close fontSize="small" />
                                        </IconButton>
                                    </React.Fragment>
                                }
                            /> 
                        </Card>
                    )
                }
                </Measure>
                <Dialog open={state.linkDialog} onClose={() => setState({...state, linkDialog: false})}>
                    <DialogContent>
                        <TextField
                            onChange={(e) => setState({...state, linkText: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <ButtonGroup>
                            <Button onClick={() => setState({...state, linkDialog: false})}>
                                Cancel
                            </Button>
                            <Button color="primary" variant="contained" onClick={() => {
                                setState({...state, linkDialog: false});
                                editor!!
                                    .chain()
                                    .focus()
                                    .extendMarkRange('link')
                                    .setLink({ href: state.linkText })
                                    .run()
                            }}>
                                Accept
                            </Button>
                        </ButtonGroup>
                    </DialogActions>
                </Dialog>
            </div>
    )
}
