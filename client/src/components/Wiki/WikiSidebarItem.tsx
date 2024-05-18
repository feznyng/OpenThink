import { IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';
import React, { CSSProperties, MouseEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Store';
import { Anchor } from '../Post/PostContentEditor';
import PostIconBase from '../Post/PostIconBase';
import DropDownButton from '../Shared/DropDownButton';
import { togglePost } from './WikiSlice';

interface WikiSidebarItemProps {
    postId: number,
    onClick: (postId: number) => void,
    selectedPostId?: number,
    deletePost: (post: any) => void,
    style?: CSSProperties
}

export default function WikiSidebarItem({postId, style, selectedPostId, deletePost, onClick}: WikiSidebarItemProps) {
    const post = useAppSelector(state => state.wiki.posts[postId])
    const dispatch = useAppDispatch()

    const [state, setState] = useState<{hover: boolean, anchorEl: Anchor}>({
        hover: false,
        anchorEl: null
    })

    const openMenu = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setState({
            ...state,
            anchorEl: e.currentTarget
        })
    }

    if (!post) {
        return <div/>
    }

    return (
        <React.Fragment>
            <ListItem 
                button 
                style={{padding: 2, position: 'relative', ...style}} 
                onClick={() => onClick(post.postId)} 
                selected={postId === selectedPostId}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
            >
                <ListItemIcon style={{marginBottom: -5, marginRight: 5}}>
                    <DropDownButton
                        open={!!post?.open}
                        style={{visibility: post.subpostIds?.length > 0 ? 'visible' : 'hidden'}}
                        onClick={() => dispatch(togglePost(post?.postId))}
                    />
                    <PostIconBase color='grey' {...post}/>
                </ListItemIcon>
                <ListItemText>
                    {post?.title && post.title.length > 0 ? post.title : 'Untitled'}
                </ListItemText>
                <IconButton size="small" style={{visibility: state.hover ? 'visible' : 'hidden'}} onClick={openMenu}>
                    <MoreHoriz fontSize='small'/>
                </IconButton>
            </ListItem>
            <Menu open={!!state.anchorEl} anchorEl={state.anchorEl}>
                <MenuItem onClick={(e) => {setState({...state, anchorEl: null}); deletePost(post)}}>
                    Delete
                </MenuItem>
            </Menu>
        </React.Fragment>
    )
}
