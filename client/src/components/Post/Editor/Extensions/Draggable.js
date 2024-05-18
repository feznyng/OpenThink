import { Extension } from '@tiptap/core';
import { NodeSelection, Plugin } from 'prosemirror-state';
import { serializeForClipboard } from 'prosemirror-view/src/clipboard';
import { absoluteRect, removeNode } from '../../../../utils/domutils';

const EventHandler = Extension.create({
    name: 'eventHandler',
    addProseMirrorPlugins() {
        const brokenClipboardAPI = false // (browser.ie && browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604)
    
        function blockPosAtCoords(coords, view) {
            console.log('test 1')
            let pos = view.posAtCoords(coords)
            let node = view.domAtPos(pos.pos)

            node = node.node
            while (node && node.parentNode) {
                if (node.parentNode.classList.contains('ProseMirror')) { // todo
                    break;
                }
                node = node.parentNode
            }

            if (node && node.nodeType === 1) {
                let desc = view.docView.nearestDesc(node, true)
                if (!(!desc || desc === view.docView)) {
                    return desc.posBefore;
                }
            }
            return null
        }

        function dragStart(e, view) {
            console.log('test 2')
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
                dropElement.setAttribute('draggable', 'true')
                dropElement.addEventListener(ondragstart, dragStart)
                dropElement.addEventListener(onclick, () => console.log('mouse down'))
                dropElement.style.position = 'fixed'
                dropElement.textContent = '⠿'
                document.body.appendChild(dropElement)
                return {
                    update(view, prevState) {

                    },
                    destroy() {
                        removeNode(dropElement)
                        dropElement = null
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
                    mousemove(view, event) {
                        let coords = { left: event.clientX + WIDTH + 10, top: event.clientY }
                        let pos = view.posAtCoords(coords)
                        let node = view.domAtPos(pos.pos)

                        node = node.node
                        while (node && node.parentNode) {
                            if (node.parentNode.classList && node.parentNode.classList.contains('ProseMirror')) { // handles hover process
                                break
                            }
                            node = node.parentNode
                        }

                        try {
                            let rect = absoluteRect(node)
                            let win = node.ownerDocument.defaultView
                            rect.top += win.pageYOffset
                            rect.left += win.pageXOffset
                            rect.width = WIDTH + 'px';
                            
                            dropElement.style.left = -WIDTH + rect.left + 'px';
                            dropElement.style.top = rect.top + 'px';
                        } catch(e) {
                        }
                        
                    },
                },
            },
        }),
        ]
    },
})
  
  export default EventHandler;