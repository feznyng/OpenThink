import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state';
import {uploadImage} from '../../../../utils/imageutils';

const handleUpload = (files, view) => {
  if (files && files.length > 0) {
    uploadImage(files[0], (imageURL) => {
      const node = view.state.schema.nodes.customImage.create({url: imageURL, s3: true});
      const transaction = view.state.tr.replaceSelectionWith(node);
      view.dispatch(transaction);
    })
  }
}

const EventHandler = Extension.create({
  name: 'eventHandler',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleDrop(view, event, slice) {
            conosle.log('over here')
            
          },
          handlePaste(view, event, slice) { 
            const files = (event.clipboardData || event.originalEvent.clipboardData).files; 
            
            handleUpload(files, view);
          },
        },
      }),
    ]
  },
})

export default EventHandler;