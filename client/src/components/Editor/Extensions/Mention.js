import React from 'react'
import Mention from '@tiptap/extension-mention';
import MentionsList from '../../../Shared/MentionsList';
import tippy from 'tippy.js';
import { useEditor, EditorContent, BubbleMenu, ReactRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react'
import { ReactNodeViewRenderer } from '@tiptap/react';
import PostIcon from '../../PostIcon';
import { getSpacePostByID } from '../../../../actions/postActions';
import { getUserByID } from '../../../../actions/userActions';
import { useHistory } from 'react-router';

const Component = (props) => {
  const {
    node
  } = props
  const [state, setState] = React.useState({
    label: node.attrs.label
  })
  React.useEffect(() => {
    if (node.attrs.type === 'post') {
      getSpacePostByID('spaces', 'undefined', node.attrs.id).then(post => {
        setState({
          ...state,
          label: post ? post.post.title : '[Deleted]',
          post: post.post,
        })
      })
    } else {
      getUserByID(node.attrs.id).then(user => {
        setState({
          ...state,
          label: user ? `${user.firstname} ${user.lastname}` : '[Deleted]'
        })
      })
    }
  }, [])

  return (
    <NodeViewWrapper style={{display: 'inline-block'}}>
      <span 
        className="mention" 
        contentEditable={false} 
        style={{cursor: 'pointer'}}
        onClick={(e) => {
          e.preventDefault();
          let url = ''
          if (node.attrs.type === 'post') {
            url = `/space/${node.attrs.space_id}/post/${node.attrs.id}`
          } else {
            url = `/profile/${node.attrs.id}`
          }
          const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
          if (newWindow) newWindow.opener = null
        }}
      >
        {state.post && <PostIcon post={state.post}/>}{!state.post && '@'}{state.label}
      </span>
    </NodeViewWrapper>
  )
}

export const CustomMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: 'user'
      },
      space_id: {
        default: null
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})


export default (getUsers, getPosts) => {
    return CustomMention.configure({
      HTMLAttributes: {
        class: 'mention',

      },
      renderLabel: ({ options, node }) => {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
      },
      suggestion: {
        allowSpaces: true,
        char: '@',
        items: query => {
          let index = 0; 
          return {users: getUsers(query).map(u => ({...u, index: index++})), posts: getPosts(query).map(u => ({...u, index: index++}))}
        },
        command: ({ editor, range, props }) => {
          const item = props;
          const attrs = item.post_id ? 
          {
              label: item.title,
              id: item.post_id,
              space_id: item.space_id,
              type: 'post'
          }
          :
          {
            label: `${item.firstname} ${item.lastname}`,
            id: item.user_id,
            type: 'user'
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: 'mention',
                attrs,
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
              reactRenderer = new ReactRenderer(MentionsList, {
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
