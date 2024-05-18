import { IconButton, ListItem, Tooltip, ListItemText, makeStyles, useTheme } from '@material-ui/core'
import { BarChart, Subject, Menu, HomeOutlined, SubjectOutlined, ChevronLeft, Add } from '@material-ui/icons'
import { withStyles } from '@material-ui/styles'
import React from 'react'
import SidenavListItem from '../Shared/SidenavListItem'
import { WikiViews } from './Wiki'
import {usePaginationFragment} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import PostNavList from '../Post/PostNavList'
import TextField from '../Shared/TextField'
import Typography from '../Shared/Typography'
import { useHistory } from 'react-router'
import { KeyboardDoubleArrowLeftRounded } from '@mui/icons-material'
import commitCreatePost from '../../mutations/CreatePost'
import { useAppDispatch, useAppSelector } from '../../Store'
import { addSidebarItem, createPost, putPost, initializeSidebar } from './WikiSlice'
import WikiSidebarItem from './WikiSidebarItem'
import { deletePost } from './WikiSlice';

export interface WikiSidebarProps {
    style?: React.CSSProperties,
    viewing: WikiViews,
    openPage: (page: string) => void,
    openPost: (postId: number) => void,
    postId?: number,
    space: any,
}

export default function WikiSidebar({style, openPage, openPost, space, postId}: WikiSidebarProps) {
    const { data } = usePaginationFragment(
        graphql`
            fragment WikiSidebarFragment on Space 
            @refetchable(queryName: "WikiSidebarPaginationFragment") {
                spaceId
                name
                posts(first: $wikiCount, after: $wikiCursor, filterTypes: ["Wiki"]) @connection(key: "WikiSidebarFragment_posts") {
                    edges {
                        node {
                            postId
                            title
                            delta
                            icon
                            bannerpic
                            numSubwikis: numPosts(filterTypes: ["Wiki"])
                        }
                    }
                    ...PostNavListFragment
                }
            }
        `,
        space
    )

    const dispatch = useAppDispatch()
    const sidebar = useAppSelector(state => state.wiki.sidebar)

    const wikiItems = data.posts.edges.map((e: any) => e.node)

    React.useEffect(() => {
        dispatch(initializeSidebar())
        wikiItems.forEach((wiki: any) => {
            dispatch(putPost(wiki))
            dispatch(addSidebarItem({postId: wiki.postId, location: 'bottom'}))
        })
    }, [wikiItems.length])

    const removePost = (post: any) => {
        if (post.postId === postId) {
            if (sidebar.length > 1) {
                const navTo = sidebar[sidebar.length - 2]
                openPost(navTo)
            } else {
                openPage('')
            }
            deletePost(post)
        } else {
            deletePost(post)
        }
    }

    return (
        <div style={{height: '100%', ...style}}>
            <div style={{marginTop: 15}}>
                {
                    sidebar && sidebar.map((id: number) => (
                        <WikiSidebarItem
                            postId={id}
                            selectedPostId={postId}
                            onClick={openPost}
                            deletePost={removePost}
                        />
                    ))
                }
            </div>
            <div style={{marginTop: 5}}>
                <ListItem
                    button
                    onClick={() => createPost(
                        {spaceId: data.spaceId}, 
                        (post) => { openPost(post.postId)}
                    )}
                >
                    <Add style={{marginLeft: 16}}/> <Typography style={{marginLeft: 8}}>New page</Typography>
                </ListItem>
            </div>
        </div>
    )
}
