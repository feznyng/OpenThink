import { NodeSelection } from 'prosemirror-state'
import { serializeForClipboard } from 'prosemirror-view/src/clipboard'
import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state';
import {blockPosAtCoords} from './helpers'

function createRect(rect) {
    if (rect == null) {
      return null
    }
    let newRect = {
      left: rect.left + document.body.scrollLeft,
      top: rect.top + document.body.scrollTop,
      width: rect.width,
      height: rect.height,
      bottom: 0,
      right: 0,
    }
    newRect.bottom = newRect.top + newRect.height
    newRect.right = newRect.left + newRect.width 
    return newRect
  }
  
export function absoluteRect(element) {
    return createRect(element.getBoundingClientRect())
}

export function removeNode(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node)
    }
  }

const EventHandler = Extension.create({
    name: 'draggable-handle',
    addProseMirrorPlugins() {
        const brokenClipboardAPI = false
        
        function dragStart(e, view) {
            if (!e.dataTransfer) return            
            let coords = { left: e.clientX + 50, top: e.clientY }
            let pos = blockPosAtCoords(coords, view)
            if (pos != null) {
                view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))

                let slice = view.state.selection.content()
                let { dom, text } = serializeForClipboard(view, slice)

                e.dataTransfer.clearData()
                e.dataTransfer.setData(brokenClipboardAPI ? 'Text' : 'text/html', dom.innerHTML)
                if (!brokenClipboardAPI) e.dataTransfer.setData('text/plain', text)

                view.dragging = { slice, move: true }
            }
        }

        let dropElement;
        const WIDTH = 24

        return [
        new Plugin({
            view(editorView) {
                dropElement = document.createElement('div')
                dropElement = document.getElementById('drag-handle')
                
                dropElement.addEventListener('dragstart', (e) => dragStart(e, editorView))
                dropElement.style.position = 'fixed'
                dropElement.setAttribute('draggable', 'true')


                const el = document.getElementById('editor-container')

                function hideElementOnScroll() {
                    if (dropElement)
                        dropElement.style.visibility = 'hidden'
                }

                function hideElementIfOutsideEditor(e) {
                    let node = e.target.parentElement;
                    let isDragHandle = false
                    while (node.parentElement) {
                        if (node.id === 'drag-handle') {
                            isDragHandle = true
                            break
                        }
                        node = node.parentElement 
                    }
                    if ((dropElement && el && el.parentElement.querySelector(':hover') !== el && !isDragHandle)) {
                        dropElement.style.visibility = 'hidden'
                    }
                }

                if (el) {
                    el.addEventListener("scroll", hideElementOnScroll)
                }
                document.addEventListener("mousemove", hideElementIfOutsideEditor)

                return {
                    update(view, prevState) {

                    },
                    destroy() {
                        // removeNode(dropElement)
                        if (el){
                            document.removeEventListener("mousemove", hideElementIfOutsideEditor)
                            el.removeEventListener("scroll", hideElementOnScroll)
                        }
                    },
                }
            },
            props: {
                handleDOMEvents: {
                    drop(view, event) {
                        setTimeout(() => {
                            let node = document.querySelector('.ProseMirror-hideselection')
                            if (node) {
                                node.classList.remove('ProseMirror-hideselection')
                            }
                        }, 50)
                    },
                    keypress(view, event) {
                        if (dropElement)
                            dropElement.style.visibility = 'hidden'
                    },
                    mousemove(view, event) {
                        let coords = { left: event.clientX + WIDTH + 50, top: event.clientY }
                        let pos = view.posAtCoords(coords)

                        if (pos) {
                            let node = view.domAtPos(pos.pos)
                            node = node.node
                            while (node && node.parentNode) {
                                if (node.parentNode.classList && node.parentNode.classList.contains('ProseMirror') || node.nodeName === 'LI') {
                                    break
                                }
                                node = node.parentNode
                            }

                            if (node.nodeName === 'OL' || node.nodeName === 'UL') {
                                return;
                            }

                            let offset = 10
                            if (node.nodeName === 'LI') {
                                offset += 13
                            }
                            const finalPos = view.posAtDOM(node)
                            if (finalPos && finalPos >= 0) {
                                const $pos = view.state.doc.resolve(finalPos)
                                const parent = $pos?.parent
                                const end = $pos.end()
                                const start = $pos.start()
                                const anchorPos = view.state.selection.$anchor.pos
                                if (parent.type.name === 'paragraph' && !(start <= anchorPos && anchorPos <= end)) {
                                    if (parent.nodeSize === 2 && (view.state.doc.nodeSize - end) < 5) {
                                        dropElement.style.visibility = 'hidden'
                                        return
                                    }
                                }
                            }
                            try {
                                let rect = absoluteRect(node)
                                let win = node.ownerDocument.defaultView
                                rect.top += win.pageYOffset
                                rect.left += win.pageXOffset
                                rect.width = WIDTH + 'px';
                                
                                dropElement.style.left = -(WIDTH + offset) + rect.left + 'px';
                                dropElement.style.top = rect.top + 'px';
                                dropElement.style.visibility = 'visible'
                            } catch(e) {
                            }
                        }
                    },
                },
            },
        }),
        ]
    },
})
  
  export default EventHandler;