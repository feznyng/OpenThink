import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { lezer } from '@codemirror/lang-lezer';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { useTheme } from '@material-ui/core';
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import axios from 'axios';
import { getImage } from '../../actions/S3Actions';

export const supportedFiles = [
    'cpp',
    'html',
    'java',
    'js',
    'json',
    'lezer',
    'markdown',
    'md',
    'php',
    'py',
    'python',
    'rust',
    'rs',
    'sql',
    'xml'
]

interface CodeViewerProps {
    file: any
}

export default function CodeViewer({file}: CodeViewerProps) {
    const {link, fileFormat} = useFragment(
        graphql`
            fragment CodeViewerFragment on Post {
                link
                fileFormat
            }
        `,
        file,
    )

    const [state, setState] = useState({
        value: ''
    })

    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'

    useEffect(() => {
        axios.get(getImage(link)).then(response => {
            if (response?.data)
                setState({
                    ...state,
                    value: response.data
                })
        })
    }, [link])

    const extensions: any[] = []

    switch (fileFormat) {
        case 'java':
            extensions.push(java())
            break
        case 'py':
            extensions.push(python())
            break
        case 'cpp':
            extensions.push(cpp())
            break
        case 'h':
            extensions.push(cpp())
            break
        case 'html':
            extensions.push(html())
            break
        case 'javascript':
            extensions.push(javascript())
            break
         case 'js':
            extensions.push(javascript())
            break
        case 'json':
            extensions.push(json())
            break
        case 'lezer':
            extensions.push(lezer())
            break
        case 'markdown':
            extensions.push(markdown())
            break
        case 'md':
            extensions.push(markdown())
            break
        case 'php':
            extensions.push(php())
            break
        case 'rs':
            extensions.push(rust())
            break
        case 'xml':
            extensions.push(xml())
            break
        case 'sql':
            extensions.push(sql())
            break
    }

    return (
        <div>
            <CodeMirror
                value={state.value}
                extensions={extensions}
                editable={false}
                theme={darkMode ? 'dark' : 'light'}
            />
        </div>
    )
}
