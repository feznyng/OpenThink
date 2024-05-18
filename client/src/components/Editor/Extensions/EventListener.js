import { Extension } from '@tiptap/core'
import { Fragment } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
// import {dropPoint} from "prosemirror-transform"
import {TextSelection, NodeSelection} from "prosemirror-state"

function dropPoint(doc, pos, slice) {
  let $pos = doc.resolve(pos)  
  if (!slice.content.size) return pos
  let content = slice.content
  const firstNodeType = content.content[0].type.name;
  if (firstNodeType === 'listItem') {
    const nodeBefore = $pos.nodeBefore;
    if (nodeBefore && nodeBefore.type.name === 'orderedList') {
      return {pos: $pos.pos - 1, type: nodeBefore.type.name}
    }

  }

  /*
  if parent is doc, use ordered list
  if parent is list item ->
    if creating a nested list -> use ordered list
    if adding to an existing list -> use list item
  else, use list item
  */

  for (let i = 0; i < slice.openStart; i++) content = content.firstChild.content
  for (let pass = 1; pass <= (slice.openStart == 0 && slice.size ? 2 : 1); pass++) {
    for (let d = $pos.depth; d >= 0; d--) {
      let bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1
      let insertPos = $pos.index(d) + (bias > 0 ? 1 : 0)
      let parent = $pos.node(d), fits = false
      if (pass == 1) {
        fits = parent.canReplace(insertPos, insertPos, content)
        if (firstNodeType === 'listItem' && parent.type.name === 'listItem') {
          fits = true
        }
      } else {
        let wrapping = parent.contentMatchAt(insertPos).findWrapping(content.firstChild.type)
        fits = wrapping && parent.canReplaceWith(insertPos, insertPos, wrapping[0])
      }
      if (fits) {
        const finalPos = bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1)
        return {pos: finalPos, type: parent.type.name}
      }
    }
  }
  return null
}

export default Extension.create({
  name: 'eventHandler',
  addKeyboardShortcuts() {
    return {
      'Backspace': () => {
        const selection = this.editor.state.selection;
        if (selection.$anchor.pos === 1) {
          this.options.exitEditor()
        }
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
            
            handleDrop(view, e, slice, moved) {
              let dragging = view.dragging
              view.dragging = null
              if (!e.dataTransfer) return

              let eventPos = view.posAtCoords({left: e.clientX, top: e.clientY})
              if (!eventPos) return
              let $mouse = view.state.doc.resolve(eventPos.pos)
              if (!$mouse) return
              if (!slice) return

              e.preventDefault()
              let point = slice ? dropPoint(view.state.doc, $mouse.pos, slice) : {pos: $mouse.pos, type: null}
              let insertPos = point.pos
              if (insertPos == null) insertPos = $mouse.pos
              let tr = view.state.tr
              if (moved) tr.deleteSelection()

              let pos = tr.mapping.map(insertPos)
              let isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1
              let beforeInsert = tr.doc

              const parent = view.state.selection.$anchor.parent;
              const newList = parent.copy(slice.content)
              const newFragment = Fragment.from(newList)

              if (isNode){
                let content;
                if (point.type === 'doc' || point.type === 'listItem') {
                  content = newFragment
                } else {
                  content = slice.content;
                }
                tr.replaceRangeWith(pos, pos, content)
              } else {
                tr.replaceRange(pos, pos, slice)
              }
                if (tr.doc.eq(beforeInsert)) return

              let $pos = tr.doc.resolve(pos)
              if (isNode && NodeSelection.isSelectable(slice.content.firstChild) &&
                  $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild)) {
                tr.setSelection(new NodeSelection($pos))
              } else {
                let end = tr.mapping.map(insertPos)
                tr.mapping.maps[tr.mapping.maps.length - 1].forEach((_from, _to, _newFrom, newTo) => end = newTo)
                tr.setSelection(TextSelection.between($pos, tr.doc.resolve(end)))
              }
              view.focus()
              view.dispatch(tr.setMeta("uiEvent", "drop"))
              return true;
            },
        },
      }),
    ]
  },
})