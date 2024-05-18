import { Editor, Extension } from '@tiptap/core'
import { Node, Node as ProsemirrorNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

export interface PlaceholderOptions {
  emptyEditorClass: string,
  emptyNodeClass: string,
  placeholder: ((PlaceholderProps: {
    editor: Editor,
    node: ProsemirrorNode,
    pos: number,
  }) => string) | string,
  showOnlyWhenEditable: boolean,
  showOnlyCurrent: boolean,
  includeChildren: boolean,
}

const getPlaceholderText = (nodeType: string, parentType: string, node: Node, pos: number, editorEmpty: boolean) => {
  /*
  if (editorEmpty) {
    return ''
  }
  */

  
  switch(nodeType) {
    case 'paragraph': 
      if (editorEmpty) {
        return 'Type something...'
      }
      if (parentType === 'blockquote') {
          return 'Quote something...'
      }
      if (parentType === 'listItem') {
          return 'List'
      }
      return "Press '/' for commands"
    case 'heading':
      return `Heading ${node.attrs.level}`
    default: 
      return "Press '/' for commands"
  }
}

const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  addOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: true,
    }
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable
            const { anchor } = selection
            const decorations: Decoration[] = []
            const activeNodes: Node[] = []
            const editorEmpty = doc.content.size <= 4
            if (!active) {
              return
            }
            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= (pos + node.nodeSize)
              const isEmpty = !node.isLeaf && !node.childCount
              const nodeType = node.type.name

              if (hasAnchor) {
                activeNodes.push(node)
              }

              if ((hasAnchor || nodeType !== 'paragraph') && isEmpty) {
                const classes = ['is-empty']

                const $pos = doc.resolve(pos)
                const parent = $pos.parent;
                
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(' '),
                  'data-placeholder': getPlaceholderText(nodeType, parent.type.name, node, pos, editorEmpty),
                })

                decorations.push(decoration)
              }

              return this.options.includeChildren
            })

            if (activeNodes.length <= 1) {
              return DecorationSet.create(doc, decorations)
            }
          },
        },
      }),
    ]
  },
})

export default Placeholder;