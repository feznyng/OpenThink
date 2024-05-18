import React from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from './Extensions/StarterKit';
import ListItem from '@tiptap/extension-list-item';
import SlashCommands from './Extensions/SlashCommands';
import TrailingNode from './Extensions/TrailingNode';
import Placeholder from './Extensions/Placeholder'
import { Color } from '@tiptap/extension-color'
import './Editor.scss'
import Menu from './Menu';
import EventListener from './Extensions/EventListener';
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider';
import Draggable from './Extensions/Draggable'
import Underline from '@tiptap/extension-underline'
import DragHandle from './Extensions/DragHandle';
import UniqueID from './Extensions/UniqueID'
import { useLocation } from 'react-router';
import { scrollToWithOffset } from '../../utils/domutils';
import Link from '../Extensions/Link';

interface EditorProps {
  content: any,
  onChange: (content: any) => void,
  focused?: boolean,
  onBlur?: () => void,
  onFocus?: () => void,
  exitEditor?: () => void,
  ydoc?: Y.Doc,
  provider?: HocuspocusProvider
}

const Editor = ({content, onChange, focused, onBlur, exitEditor, onFocus, ydoc, provider}: EditorProps) => {
  const editor = useEditor({
      extensions: [
        StarterKit,
        EventListener.configure({
          exitEditor
        }),
        Placeholder,
        TrailingNode,
        ListItem,
        SlashCommands,
        Color,
        Draggable,
        Link,
        Underline,
        UniqueID.configure({
          types: ['heading', 'paragraph'],
        })
      ],
      onBlur,
      onFocus,
      content,
      onUpdate() {
          const json = (this as any).getJSON();
          const callback = () => onChange(json)
          callback()
      },
      editorProps: {
          handleKeyDown: (view, event) => {
              return false
          }
      },
      
  });

  const location = useLocation()

  React.useEffect(() => {
    if (focused) {
      editor?.commands.focus();
    } else {
      editor?.commands.blur();
    }
  }, [focused])

  React.useEffect(() => {
    const hash = location.hash
    if (editor && hash && hash.length > 0) { 
      const container = document.getElementById("editor-container")
      const elements = document.querySelectorAll(`[data-id="${hash.substring(1, hash.length)}"]`)
      if (container && elements.length > 0) {
        const element = elements[0]
        element.id = 'scroll-target'
        scrollToWithOffset('scroll-target', 60, 'auto', (container as any))
      }
    }
   
  }, [editor, location.hash])

  return (
    <div 
      style={{textAlign: 'left', display: 'flex', justifyContent: 'center', position: 'relative', width: '100%'}} 
      className='wiki-editor'
      id='editor-container'
    >
      <DragHandle editable editor={editor!!}/>
      {
        editor && 
        <div style={{position: 'relative', width: '100%'}}>
            <EditorContent editor={editor}/>
            <div style={{width: '100%', height: 30, marginTop: -10}}/>
        </div>
      }
      {
        editor && 
        <BubbleMenu editor={editor} pluginKey={'bubbleMenu'}>
            <Menu
                editor={editor}
            />
        </BubbleMenu>
      }
    </div>
  )
}

export default Editor