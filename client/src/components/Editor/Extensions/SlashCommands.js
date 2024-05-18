import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { useEditor, EditorContent, BubbleMenu, ReactRenderer } from '@tiptap/react'
import CommandsList from './CommandsList';
import tippy from 'tippy.js';
import { TextSelection } from 'prosemirror-state'
import Typography from '../../Shared/Typography';
import { FormatListBulleted, FormatListNumbered, FormatQuote } from '@material-ui/icons';
import { Divider } from '@material-ui/core';
import { DensityLarge, DensitySmall } from '@mui/icons-material';
const SlashCommandsExtension = Extension.create({
  name: 'slash-commands',

  defaultOptions: {
    suggestion: {
      char: '/',
      startOfLine: false,
      command: ({ editor, range, props }) => {
        props.command({ editor, range })
      },
    },
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const SlashCommands = SlashCommandsExtension.configure({
    suggestion: {
      items: ({editor, query}) => {
        return [
          {
            title: 'Heading 1',
            description: 'Large section heading',
            command: ({editor, range}) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', { level: 1 })
                .run()
            },
            icon: <Typography style={{marginLeft: 3}}>H1</Typography>
          },
          {
            title: 'Heading 2',
            description: 'Medium section heading',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', { level: 2 })
                .run()
            },
            icon: <Typography style={{marginLeft: 3}}>H2</Typography>
          },
          {
            title: 'Heading 3', 
            description: 'Small section heading',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', { level: 3})
                .run()
            },
            icon: <Typography style={{marginLeft: 3}}>H3</Typography>
          },
          {
            title: 'Bulleted List', 
            description: 'Create bulleted list',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleBulletList()
                .run()
            },
            icon: <FormatListBulleted/>
          },
          {
            title: 'Numbered List', 
            description: 'Created numbered list',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleOrderedList()
                .run()
            },
            icon: <FormatListNumbered/>
          },
          {
            title: 'Quote', 
            description: 'Point out a quote',
            command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBlockquote()
                  .run()
            },
            icon: <FormatQuote/>
          },
          {
            title: 'Divider', 
            description: 'Organize your post',
            icon: <DensityLarge/>,
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange({from: range.from - 1, to: range.to})
                .insertContent({ type: 'horizontalRule' })
                .command(({ tr, dispatch }) => {
                  if (dispatch) {
                    const { parent, pos } = tr.selection.$from
                    const posAfter = pos + 1
                    const nodeAfter = tr.doc.nodeAt(posAfter)
      
                    if (nodeAfter) {
                      tr.setSelection(TextSelection.create(tr.doc, posAfter))
                    } else {
                      // add node after horizontal rule if it’s the end of the document
                      const node = parent.type.contentMatch.defaultType?.create()
      
                      if (node) {
                        tr.insert(posAfter, node)
                        tr.setSelection(TextSelection.create(tr.doc, posAfter))
                      }
                    }
      
                    tr.scrollIntoView()
                  }
      
                  return true
                })
                .run()
            },
          },
        ].filter(item => {
            console.log(query)
            return item.title.toLowerCase().startsWith((query ? query : '').toLowerCase())
          }).slice(0, 10)
      },
      render: () => {
        let reactRenderer
        let popup

        return {
          onStart: props => {
            reactRenderer = new ReactRenderer(CommandsList, {
                props,
                editor: props.editor,
            })

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'auto',
                hideOnClick: false
            })
          },
          onUpdate(props) {
            reactRenderer.updateProps(props)

            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            })
          },
          onKeyDown(props) {
            return reactRenderer.ref?.onKeyDown(props)
          },
          onExit() {
            popup[0].destroy()
            reactRenderer.destroy()
          },
        }
      },
    },
  });
  export default SlashCommands;