import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import CommandsList from './CommandsList';

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
      items: query => {
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
                return;
                
            },
          },
          {
            title: 'Heading 2',// done
            description: 'Medium section heading',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', { level: 2 })
                .run()
            },
          },
          {
            title: 'Heading 3', // done
            description: 'Small section heading',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', { level: 3})
                .run()
            },
          },
          {
            title: 'Bulleted List', // done
            description: 'Create bulleted list',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleBulletList()
                .run()
            },
          },
          {
            title: 'Numbered List', // done
            description: 'Created numbered list',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleOrderedList()
                .run()
            },
          },
          {
            title: 'To-Do List', // done
            description: 'Create to-do list',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleTaskList()
                .run()
            },
          },
          {
            title: 'Quote', // done
            description: 'Point out a quote',
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleBlockquote()
                    .run()
            },
          },
          {
            title: 'Divider', // done
            description: 'Organize your post',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setHorizontalRule()
                .run()
            },
          },
          {
            title: 'Image',
            description: 'Add an image',
            command: ({ editor, range }, actualURL, s3) => {
                console.log(editor, range, actualURL)
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .run()
                editor
                  .commands.insertContent({
                  type: 'customImage',
                  attrs: {
                    url: actualURL,
                    s3,
                  },
                })
            },
          },
          {
            title: 'Code', //done
            description: 'Add a code block',
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleCodeBlock()
                .run()
            },
          },
        ].filter(item => 
            item.title.toLowerCase().startsWith(query.toLowerCase())
          ).slice(0, 10)
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
                placement: 'bottom-start',
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