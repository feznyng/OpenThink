import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import React from 'react';
import tippy from 'tippy.js';
import HashtagList from '../../../Shared/HashTagList';

const Component = (props) => {
  return (
    <NodeViewWrapper style={{display: 'inline-block'}}>
      <span className="mention" contentEditable={false}>#{props.node.attrs.label}</span>
    </NodeViewWrapper>
  )
}

export const Hashtag = Node.create({
  name: 'channel-mention',

  defaultOptions: {
    HTMLAttributes: {},
    renderLabel({ options, node }) {
      return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
    },
    suggestion: {
      char: '#',
      command: ({ editor, range, props }) => {
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'channel-mention',
              attrs: props,
            },
            {
              type: 'text',
              text: ' ',
            },
          ])
          .run()
      },
      allow: ({ editor, range }) => {
        return editor.can().insertContentAt(range, { type: 'channel-mention' })
      },
    },
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => {
          return {
            id: element.getAttribute('data-id'),
          }
        },
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }

          return {
            'data-id': attributes.id,
          }
        },
      },

      label: {
        default: null,
        parseHTML: element => {
          return {
            label: element.getAttribute('data-label'),
          }
        },
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }

          return {
            'data-label': attributes.label,
          }
        },
      },
      type: {
        default : 'channel'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-channel-mention]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ 'data-channel-mention': '' }, this.options.HTMLAttributes, HTMLAttributes),
      this.options.renderLabel({
        options: this.options,
        node,
      }),
    ]
  },

  renderText({ node }) {
    return this.options.renderLabel({
      options: this.options,
      node,
    })
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => this.editor.commands.command(({ tr, state }) => {
        let isMention = false
        const { selection } = state
        const { empty, anchor } = selection

        if (!empty) {
          return false
        }

        state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
          if (node.type.name === this.name) {
            isMention = true
            tr.insertText(this.options.suggestion.char || '', pos, pos + node.nodeSize)

            return false
          }
        })

        return isMention
      }),
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})


export default (getTags) => {
    return Hashtag.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion: {
        allowSpaces: true,
        char: '#',
        items: getTags,
        command: ({ editor, range, props }) => {
          const item = props;
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: 'channel-mention',
                attrs:  {
                    label: item.name,
                    id: item.room_id,
                }
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run()
        },
        render: () => {
          let reactRenderer
          let popup

          return {
            onStart: props => {
              reactRenderer = new ReactRenderer(HashtagList, {
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
    })
}