import React, { forwardRef, Fragment, MouseEvent, useImperativeHandle, useMemo, useState } from 'react'
import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import './PostContentEditor.scss'
import { primaryColor } from '../../theme'
import { Edit, EmojiEmotions, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatStrikethrough, FormatUnderlined, LinkRounded } from '@material-ui/icons'
import { Divider, IconButton, Menu, Tooltip, useTheme } from '@material-ui/core'
import LinkEditorMenu from './LinkEditorMenu'
import ActiveLinkTooltip from './ActiveLinkTooltip'
import Link from '../Extensions/Link'
import Highlight from '@tiptap/extension-highlight'
import { Picker } from 'emoji-mart'
import Draggable from '../Editor/Extensions/Draggable'
import DragHandle from '../Editor/Extensions/DragHandle';
import UniqueID from '../Editor/Extensions/UniqueID'
import SlashCommands from '../Editor/Extensions/SlashCommands';
import TrailingNode from '../Editor/Extensions/TrailingNode';
import Placeholder from '../Editor/Extensions/Placeholder'
import { Color } from '@tiptap/extension-color'
import Typography from '../Shared/Typography'
import Button from '../Shared/Button'

const iconProps: any = {fontSize: 'small'}

export interface PostContentEditorProps {
    postId?: number
    content?: Content,
    onChange?: (content: Content) => void,
    readonly?: boolean,
    style?: React.CSSProperties,
    variant?: 'outlined' | 'plain' | 'focusOutlined',
    placeholder?: string,
    extended?: boolean,
    showEditButtons?: boolean
}

export type Anchor = null | Element

interface PostContentEditorState {
    hover: boolean,
    focused: boolean,
    linkAnchor: Anchor,
    existingLinkAnchor: Anchor,
    existingLink: string,
    emojiAnchor: Anchor
}

export default forwardRef(function PostContentEditor({readonly, showEditButtons, extended, onChange, content, style, variant, placeholder}: PostContentEditorProps, ref) {
    const [newContent, setContent] = React.useState()

    const extensions: any = [
        StarterKit,
        Underline,
        Link.configure({
            openOnClick: readonly,
        }),
        Highlight.configure({ multicolor: true }),
        Placeholder.configure({
            placeholder
        }),
        Color,
    ]

    if (extended) {
        extensions.push(
            SlashCommands,
            TrailingNode,
            Draggable,
            UniqueID.configure({
                types: ['heading', 'paragraph'],
            }),
        )
    }

    const editor = useEditor({
        editable: !readonly,
        extensions,
        content,
        onUpdate() {
            const json = (this as any).getJSON()
            setContent(json)
        }
    }) 

    React.useEffect(() => {
        if (newContent && onChange) {
            onChange(newContent)
        }
    }, [newContent])

    const [state, setState] = useState<PostContentEditorState>({
        hover: false,
        focused: false,
        linkAnchor: null,
        existingLinkAnchor: null,
        emojiAnchor: null,
        existingLink: ''
    })

    const focus = (e: React.MouseEvent) => {
        if (!editor?.isFocused)
            editor?.commands.focus(editor?.isEmpty ? 'all' : 'end')
    }

    const onLinkToggle = (e: React.MouseEvent) => {
        editor?.chain().focus().toggleHighlight({color: '#b3d8ff'}).run()
        const {link, element} = checkForLink()
        setState({...state, linkAnchor: e.currentTarget, existingLink: link, })
    }

    const onLinkEditorClose = (set?: boolean) => {
        console.log('over here')
        if (!set) {
            editor?.chain()
            .focus()
            .undo()
            .run()
        }
        setState({...state, linkAnchor: null})
        
    }

    const insertLink = (link: string) => {
        if (link === '') {
            editor?.chain().focus().undo().extendMarkRange('link').unsetLink().run()
        } else {
            editor?.chain()
                .focus()
                .undo()
                .setLink({ href: link })
                .run()
        }
  
        onLinkEditorClose(true)
    }
    
    const removeLink = () => {
        editor?.chain().focus().extendMarkRange('link').unsetLink().run()
        setState({
            ...state,
            existingLinkAnchor: null
        })
    }

    variant = variant ? variant : 'outlined'
    const darkMode = useTheme().palette.type === 'dark'
    const getEditorStyle = () => {
        let borderColor = '#C4C4C4'
        let borderWidth = 1.2
        let padding = 11
        if (readonly)
            return {}
        else if (variant === 'outlined') {
            if (state.hover) {
                borderColor = darkMode ? 'white' : 'black'
                padding = 11
            } else if (darkMode) {
                borderColor = 'grey'
            }
            if (state.focused) {
                borderWidth = 2
                borderColor = primaryColor
                padding = 10
            }
            return {border: 'solid', borderWidth, borderColor, borderRadius: 8, padding}
        } else if (variant === 'focusOutlined') {
            const hovering = state.hover && (!showEditButtons || !editor?.isEmpty)
            padding = 10

            if (hovering) {
                borderColor = darkMode ? 'white' : 'black'
            } 
            
            if (state.focused) {
                borderColor = primaryColor
            } 
            
            if (!hovering && !state.focused) {
                borderColor = 'transparent'
            }
            
            return {border: 'solid', borderWidth, borderColor, borderRadius: 8, padding, marginLeft: -padding}
        }
        return {}
    }

    const getToolbarStyle = () => {
        if (variant === 'outlined' || variant === 'focusOutlined') {
            return {
                bottom: 5, left: 3, 
            }
        }

        return {
            bottom: 0, left: -2
        }
    }

    const getPlaceholderStyle = () => {
        if (variant === 'outlined' || variant === 'focusOutlined') {
            return {
                top: 9, left: 11, 
            }
        }

        return {
            top: 0, left: 0
        }
    }

    const setContents = (content: Content) => {
        editor?.commands.setContent(content)
    }

    useImperativeHandle(ref, () => ({
        focus,
        setContents
    }));

    React.useEffect(() => {
        if (editor?.isActive('link')) {
            const {link, element} = checkForLink()
            setState({
                ...state,
                existingLink: link,
                existingLinkAnchor: element
            })
        } else {
            setState({
                ...state,
                existingLinkAnchor: null
            })
        }
    }, [editor?.state.selection.$from.pos, editor?.state.selection.$to.pos])
    
    const checkForLink = () => {
        let link = ''
        let element: Element | null | Node = null;
        if (editor) {
            const selection = editor.state.selection
            editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                const linkMark = node.marks.find(m => m.type.name === 'link')
                if (linkMark) {
                    const dom = editor.view.domAtPos(pos + 1)
                    element = dom.node.parentElement
                    link = linkMark.attrs.href
                    return false
                }
            })
        }
        
        return {link, element}
    }

    const insertOptions = [
        {
            name: 'Add Emoji',
            icon: <EmojiEmotions {...iconProps}/>,
            onClick: (e: MouseEvent) => setState({...state, emojiAnchor: e.currentTarget})
        }
    ]

    const formattingOptions = [
        {
            name: 'Bold',
            icon: <FormatBold {...iconProps}/>,
            onClick: () => editor?.chain().focus().toggleBold().run(),
            type: 'bold',
        },
        {
            name: 'Italicize',
            icon: <FormatItalic {...iconProps}/>,
            onClick: () => editor?.chain().focus().toggleItalic().run(),
            type: 'italic',
        },
        {
            name: 'Underline',
            icon: <FormatUnderlined {...iconProps}/>,
            onClick: () => editor?.chain().focus().toggleUnderline().run(),
            type: 'underline',
        },
        {
            name: 'Strikethrough',
            icon: <FormatStrikethrough {...iconProps}/>,
            onClick: () => editor?.chain().focus().toggleStrike().run(),
            type: 'strike',
        },
        {
            name: 'Bulleted List',
            icon: <FormatListBulleted {...iconProps}/>,
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
            type: 'bulletList',
        },
        {
            name: 'Numbered List',
            icon: <FormatListNumbered {...iconProps}/>,
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
            type: 'orderedList',
        },
        {
            name: 'Insert Link',
            icon: <LinkRounded {...iconProps}/>,
            onClick: onLinkToggle,
            type: 'link',
        },
    ]

    const closeEmojiPicker = () => {
        setState({
            ...state,
            emojiAnchor: null,
        })
    }

    const [anchorEl, setAnchorEl] = useState(null)

    return (
        <React.Fragment>
            <div 
                style={{...getEditorStyle(), ...style, cursor: 'text', position: 'relative'}} 
                onClick={focus}
                className={extended ? "wiki-editor" : 'post-content'}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
                onFocus={() => setState({...state, focused: true})}
                onBlur={() => setState({...state, focused: false, existingLink: '', existingLinkAnchor: null})}
                id='editor-container'
            >
                {
                    extended && 
                    <DragHandle editable editor={editor!!}/>
                }


                {
                    showEditButtons && !editor?.isFocused && editor?.isEmpty && !readonly &&
                    <Button
                        variant='outlined'
                        color="primary"
                        onClick={(e) => {
                            editor?.commands.focus()
                        }}
                        startIcon={<Edit/>}
                        size="small"
                    >
                        Add Description
                    </Button>
                }

                <EditorContent editor={editor} style={{minHeight: style?.minHeight}}/>
                {
                    placeholder && (!showEditButtons || editor?.isFocused) && editor?.isEmpty && !readonly &&
                    <Typography style={{position: 'absolute', ...getPlaceholderStyle()}} color="textSecondary">
                        {placeholder}
                    </Typography>
                }
                
                {
                    !extended && !readonly && 
                    <React.Fragment>
                        <div style={{height: 20}}/>
                        <div onMouseDown={e => e.preventDefault()} style={{position: 'absolute', ...getToolbarStyle(), visibility: state.focused ? 'visible' : 'hidden'}}>
                            <div style={{display: 'flex', alignItems: 'center', float: 'right', width: '100%'}}>
                                {
                                    insertOptions.map(({name, icon, onClick}) => (
                                        <Tooltip
                                            title={name}
                                        >
                                            <IconButton
                                                size="small"
                                                style={{marginRight: 4}}
                                                onClick={onClick}
                                            >
                                                {icon}
                                            </IconButton>
                                        </Tooltip>
                                    ))
                                }
                                <Divider orientation="vertical" flexItem style={{marginRight: 4}}/>
                                {
                                    formattingOptions.map(({name, icon, type, onClick}) => (
                                        <Tooltip
                                            title={name}
                                        >
                                            <IconButton
                                                size="small"
                                                style={{marginRight: 4}}
                                                onClick={onClick}
                                                color={editor?.isActive(type) ? 'primary' : 'default'}
                                            >
                                                {icon}
                                            </IconButton>
                                        </Tooltip>
                                    ))
                                }
                            </div>
                        </div>
                        <LinkEditorMenu
                            open={!!state.linkAnchor}
                            anchorEl={state.linkAnchor}
                            onConfirm={insertLink}
                            onClose={() => onLinkEditorClose()}
                            defaultLink={state.existingLink}
                        />
                        <ActiveLinkTooltip
                            open={!!state.existingLinkAnchor}
                            anchorEl={state.existingLinkAnchor}
                            link={state.existingLink}
                            removeLink={removeLink}
                            editLink={onLinkToggle}
                            style={{visibility: !!state.linkAnchor ? 'hidden' : 'visible'}}
                        />
                        {
                            state.emojiAnchor &&
                            <Menu
                                open={!!state.emojiAnchor}
                                anchorEl={state.emojiAnchor}
                                onClose={closeEmojiPicker}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                            >
                                <Picker
                                    onSelect={(emoji) => {
                                        console.log(emoji)
                                        closeEmojiPicker()
                                        editor?.commands.insertContent((emoji as any).native)
                                    }}
                                    showPreview={false}
                                />
                            </Menu>
                        }
                    </React.Fragment>
                }
                
            </div>
        </React.Fragment>
    )
})
