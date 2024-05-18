import { Extension } from '@tiptap/core'
import { dropCursor } from './PMDropCursor';

export const Dropcursor = Extension.create({
  name: 'dropCursor',

  defaultOptions: {
    color: 'currentColor',
    width: 1,
    class: null,
  },

  addProseMirrorPlugins() {
    return [
      dropCursor(this.options),
    ]
  },
})