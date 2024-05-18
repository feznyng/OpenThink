import { IconButton, Paper, Typography } from '@material-ui/core'
import { Add, ChevronLeft, Comment, Menu, Search, Settings } from '@material-ui/icons'
import React from 'react'
import { useHistory } from 'react-router'
import RoundedTextField from '../Shared/RoundedTextField'
import TextField from '../Shared/TextField'
import { WikiViews } from './Wiki'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button'

interface WikiHeaderProps {
    style?: React.CSSProperties,
    toggleSidebar?: () => void,
    viewing: WikiViews,
    space: any
}

export default function WikiHeader({style, space, toggleSidebar}: WikiHeaderProps) {
    const {name} = useFragment(
        graphql`
            fragment WikiHeaderFragment on Space {
                name
            }
        `,
        space
    )

    const history = useHistory()

    return (
        <div style={{width: '100%', height: 50, boxShadow: 'none', display: 'flex', alignItems: 'center', ...style}}>
            <div style={{display: 'flex', alignItems: 'center', width: '100%', position: 'relative'}}>
                <IconButton
                    onClick={toggleSidebar}
                    style={{marginRight: 5, marginLeft: 5}}
                    size="small"
                >
                    <Menu/>
                </IconButton>
                <TextField
                    InputProps={{
                        startAdornment: <Search style={{marginRight: 3}}/>,
                        style: {borderRadius: 20}
                    }}
                    size="small"
                    placeholder='Search'
                />
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <Button style={{marginRight: 5}} startIcon={<Add/>}>
                    Insert
                </Button>
                <IconButton style={{marginRight: 10}} size="small">
                    <Settings/>
                </IconButton>
                <IconButton style={{marginRight: 10}} size="small">
                    <Comment/>
                </IconButton>
            </div>
        </div>
    )
}
