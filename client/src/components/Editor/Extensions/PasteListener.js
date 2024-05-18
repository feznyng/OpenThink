import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const EventHandler = Extension.create({
  name: 'eventHandler',
  defaultOptions: {
    onPaste() {
        console.log('bruh')
    }
  },
  addProseMirrorPlugins() {
    const onPaste = this.options.onPaste;
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleClick(view, pos, event) { /* … */ },
          handleDoubleClick(view, pos, event) { /* … */ },
          handlePaste(view, event, slice) {
            
            const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length;
            if (!hasFiles) {
                return;
            } else {
                onPaste(event.clipboardData.files);
            }

           },
        },
      }),
    ]
  },
})

export default EventHandler;