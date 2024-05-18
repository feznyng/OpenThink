  import { Button, ButtonGroup, IconButton, Typography } from '@material-ui/core'
  import { Add, DragIndicator } from '@material-ui/icons'
  import { Extension } from '@tiptap/core'
  import { NodeSelection, Plugin } from 'prosemirror-state'
  import { serializeForClipboard } from 'prosemirror-view/src/clipboard'
  import ReactDOM from 'react-dom'
  function removeNode(node) {
    node.parentNode.removeChild(node)
  }

  function absoluteRect(node) {
    const data = node.getBoundingClientRect()

    return {
      top: data.top,
      left: data.left,
      width: data.width,
    }
  }

  export default Extension.create({
    addProseMirrorPlugins() {
      function blockPosAtCoords(coords, view) {
        const pos = view.posAtCoords(coords)
        let node = view.domAtPos(pos.pos)

        node = node.node

        while (node && node.parentNode) {
          if (node.parentNode?.classList?.contains('ProseMirror')) { // todo
            break
          }

          node = node.parentNode
        }

        if (node && node.nodeType === 1) {
          const desc = view.docView.nearestDesc(node, true)

          if (!(!desc || desc === view.docView)) {
            return desc.posBefore
          }
        }
        return null
      }

      function dragStart(e, view) {
        view.composing = true
        if (!e.dataTransfer) {
          return
        }

        const coords = { left: e.clientX + 130, top: e.clientY }
        const pos = blockPosAtCoords(coords, view)

        if (pos != null) {
          view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))

          const slice = view.state.selection.content()
          
          const { dom, text } = serializeForClipboard(view, slice)

          e.dataTransfer.clearData()
          e.dataTransfer.setData('text/html', dom.innerHTML)
          e.dataTransfer.setData('text/plain', text)

          const el = document.querySelector('.ProseMirror-selectednode')
          e.dataTransfer?.setDragImage(el, 0, 0)

          view.dragging = { slice, move: true }
        }
      }

      let dropElement
      const WIDTH = 35
      return [
        new Plugin({
          view(editorView) {
            const element = document.createElement('div')
            element.draggable = 'true'
            element.classList.add('global-drag-handle')
            element.addEventListener('dragstart', e => dragStart(e, editorView))
            dropElement = element
            document.body.appendChild(dropElement)
              ReactDOM.render((
                  <div>
                      <IconButton size="small">
                          <DragIndicator size="small"/>
                      </IconButton>
                  </div>
              ), element);


        function onMouseMove(event) {
          dropElement.style.visibility = 'hidden'

          const coords = {
            left: event.clientX + 100,
            top: event.clientY,
          }

          const pos = editorView.posAtCoords(coords)

          if (pos) {
            let node = editorView.domAtPos(pos?.pos);
            if (node) {
              node = node.node
              while (node && node.parentNode) {
                if (node.parentNode?.classList?.contains('ProseMirror')) { // todo
                  break
                };
                node = node.parentNode
              }

              if (node instanceof Element) {
                const cstyle = window.getComputedStyle(node)
                const lineHeight = parseInt(cstyle.lineHeight, 10)
                // const top = parseInt(cstyle.marginTop, 10) + parseInt(cstyle.paddingTop, 10)
                const top = 0
                const rect = absoluteRect(node)
                const win = node.ownerDocument.defaultView
                rect.top += win.pageYOffset + top - 3
                rect.left += win.pageXOffset
                rect.width = `${WIDTH}px`

                dropElement.style.left = `${-WIDTH + rect.left}px`
                dropElement.style.top = `${rect.top}px`
                dropElement.style.visibility = ''
              }
            }
          } 
        }

        function onDragOver(event) {
          const coords = {
            left: event.clientX,
            top: event.clientY,
          }

          
          document.elementFromPoint(event.clientX, event.clientY)
        }

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('dragover', onDragOver)
            return {
              destroy() {
                removeNode(dropElement)
                dropElement = null
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('dragover', onDragOver);
              },
            }
          },
          props: {
            handleDOMEvents: {
            },
          },
        }),
      ]
    },
  })