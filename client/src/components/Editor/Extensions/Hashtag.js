import HashtagList from '../../../Shared/HashTagList';
import tippy from 'tippy.js';
import { ReactRenderer } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'
import { ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'

const Component = (props) => {
  return (
    <NodeViewWrapper style={{display: 'inline-block'}}>
      <span className="mention" contentEditable={false}>#{props.node.attrs.label}</span>
    </NodeViewWrapper>
  )
}

export const Hashtag = Node.create({
  name: 'hashtag',

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
              type: 'hashtag',
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
        return editor.can().insertContentAt(range, { type: 'hashtag' })
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
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-hashtag]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ 'data-hashtag': '' }, this.options.HTMLAttributes, HTMLAttributes),
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
                type: 'hashtag',
                attrs:  {
                    label: item.info,
                    id: item.tag_id,
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