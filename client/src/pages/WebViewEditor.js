import React from 'react'
import PostTiptap from '../components/Post/Editor/PostTipTap'

export default function WebViewEditor() {   
    const [state, setState] = React.useState({
        message: ''
    });

    window.addEventListener("message", message => {
        try {
            const content = JSON.parse(message.data)
            setState({
                ...state,
                content,
            })
        } catch {
            setState({
                ...state,
                content: '',
            })
        }
       
    });

    return (
        <div>

            <PostTiptap
                post={{delta: state.content}}
                onContentChange={() => {}}
                readonly
                finish={() => {}}
                imageChange={() => {}}
                onFileChange={() => {}}
                getUsers={() => []}
                getPosts={() => []}
                getTags={() => []}
            />
        </div>
    )
}
