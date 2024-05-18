import React, { useEffect, useState } from 'react'
import { useMutation, usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { Checkbox, IconButton, Menu, MenuItem } from '@material-ui/core';
import Typography from '../Shared/Typography';
import PostContentEditor from '../Post/PostContentEditor';
import UserListItem from '../User/UserListItem'
import { MoreVert } from '@material-ui/icons';

interface ActionItemProps {
    post: any,
    userId?: number,
    complete: (postId: number, connectionId: string) => void,
    reportCount: (postId: number, count: number) => void,
    onDelete: () => void,
}

export default function ActionItem({post, userId, reportCount, onDelete, complete}: ActionItemProps) {
    const {data} = usePaginationFragment(
        graphql`
            fragment ActionItemFragment on Post @refetchable(queryName: "ActionItemPaginationQuery") {
                title
                delta
                postId
                users(first: $userCount, after: $userCursor, userTypes: ["Completed"]) @connection(key: "ActionItemFragment_users") {
                    __id
                    edges {
                        node {
                            firstname
                            lastname
                            userId
                            ...UserListItemFragment
                        }
                    }
                }
            }
        `,
        post
    )
    const [state, setState] = useState<any>({
        loading: false,
        anchorEl: null
    })

    const connectionId = data.users?.__id
    const completed = data.users?.edges.find(({node}: any) => node.userId === userId)!!

    useEffect(() => {
        setState({
            loading: true,
        })
        setTimeout(() => {
            setState({
                loading: false,
            })
        }, 1000)
        if (data.postId && data.users.edges) {
            reportCount(data.postId, data.users.edges.length)
        }
    }, [data.postId])

    return (
         <div style={{marginBottom: 15, position: 'relative', zIndex: 1000}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <Checkbox
                    style={{
                        transform: "scale(1.25)",
                    }}
                    checked={!!completed}
                    onClick={(e) => {e.preventDefault(); complete(data.postId, connectionId)}}
                />
                <Typography variant='h6'>
                    {data?.title}
                </Typography> 
            </div>
            <div style={{marginLeft: 45}}>
                {
                    !state.loading && data?.delta && 
                    <PostContentEditor
                        content={data?.delta}
                        readonly
                    />
                }
                <div>
                    {
                        data.users.edges.map((e: any) => (
                            <div>
                                <UserListItem
                                    user={e.node}
                                    disablePreview
                                    disableLink
                                />
                            </div>
                        ))
                    }
                    {
                        data.users.edges.length === 0 && 
                        <Typography>
                            No one's checked this off yet. Be the first!
                        </Typography>
                    }
                </div>
            </div>
            <div style={{position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center'}}>
                <IconButton
                    onClick={e => setState({...state, anchorEl: e.currentTarget})}
                >
                    <MoreVert/>
                </IconButton>
            </div>
           
            <Menu
                anchorEl={state.anchorEl}
                open={!!state.anchorEl}
                onClose={() => setState({...state, anchorEl: null})}
            >
                <MenuItem onClick={onDelete}>
                    Delete
                </MenuItem>
            </Menu>
        </div>
    )
}
