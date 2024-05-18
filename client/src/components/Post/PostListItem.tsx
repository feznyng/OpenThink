import { Fade, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core'
import { ChevronRight, MoreVert } from '@material-ui/icons'
import React, { CSSProperties, Fragment, ReactElement, useState } from 'react'
import { useFragment } from 'react-relay'
import PostIcon, { PostIconProps } from './PostIcon'
import graphql from 'babel-plugin-relay/macro';
import { useHistory } from 'react-router'
import ListItem from '../Shared/ListItem'
import { canHover } from '../../utils/domutils'

interface PostListItemProps {
    post: any,
    onClick?: (postId: number) => void,
    style?: CSSProperties,
    includeArrow?: boolean,
    iconProps?: Partial<PostIconProps>,
    selected?: boolean,
    menuOptions?: {icon: ReactElement, name: string, tip?: string}[],
    onMenu?: (name: string) => void
}

export default function PostListItem({post, iconProps, menuOptions, onMenu, selected, onClick, style}: PostListItemProps) {
    const {title, postId, space, ...data} = useFragment(
        graphql`
            fragment PostListItemFragment on Post {
                title
                postId
                space: spacePost(key: "PostListItem") {
                    spaceId
                }
                ...PostIconFragment
            }
        `,
        post
    )

    const [anchorEl, setAnchorEl] = useState<null | Element>(null)
    const [hover, setHover] = useState(false)
    const history = useHistory()

    return (
        <div 
            style={{...style, position: 'relative'}}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <ListItem
                button
                selected={selected}
                icon={
                    <PostIcon
                        {...iconProps}
                        post={data}
                        size={20}
                    />
                }
                primary={title}
                size='small'
                onClick={() => onClick ? onClick(postId) : history.push(`/space/${space?.spaceId}/post/${postId}`)}
            />
            <div style={{position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
                {
                    menuOptions && menuOptions.length > 0 && 
                    <Fragment>
                       <Fade in={(hover || !canHover)}>
                            <IconButton onClick={(e) => {setAnchorEl(e.currentTarget); setHover(false)}} size="small">
                                <MoreVert/>
                            </IconButton>
                        </Fade>
                        <Menu
                            anchorEl={anchorEl}
                            open={!!anchorEl}
                            onClose={() => {setAnchorEl(null); setHover(false)}}
                        >
                            {
                                menuOptions.map(({icon, name, tip}) => (
                                    <MenuItem
                                        onClick={() => onMenu && onMenu(name)}
                                    >
                                        <ListItemIcon>
                                            {icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={name}
                                            secondary={tip}
                                        />
                                    </MenuItem>
                                ))
                            }
                        </Menu>
                    </Fragment>
                }
            </div>
        </div>
        
    )
}
