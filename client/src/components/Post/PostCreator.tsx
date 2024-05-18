import { Card, CardContent, CardHeader, DialogActions, DialogContent, DialogTitle, Divider, IconButton, ListItem, Tooltip, useMediaQuery } from '@material-ui/core'
import React, { useEffect, useRef } from 'react'
import UserIcon from '../User/UserIcon'
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import RoundedTextField from '../Shared/RoundedTextField';
import { useTheme } from '@mui/material/styles';
import { getPostColor, getPostIcon } from '../../utils/postutils';
import Typography from '../Shared/Typography';
import { CardActions, ListItemIcon, ListItemText } from '@mui/material';
import Dialog from '../Shared/Dialog';
import PostEditor from './PostEditor';
import Button from '../Shared/Button';
import { Add, Close } from '@material-ui/icons';
import roundMinutes from '../../utils/dateutils';
import { scrollToWithOffset } from '../../utils/domutils';
import commitCreatePost from '../../mutations/CreatePost';
import PostAttachActions from './PostAttachActions';
import {v4 as uuid} from 'uuid'
import { FilePreviewItem } from '../File/FilePreview'
import { changeImage } from '../../actions/S3Actions'

const defaultPreviewTypes = ['Information', 'Poll', 'Question']

const inlineEditorId = 'inline-editor-id'

const defaultView = 'inline'

export interface PostCreatorProps {
    me: any,
    space?: any,
    post?: any,
    style?: React.CSSProperties,
    variant?: 'dialog' | 'inline',
    previewTypes?: string[],
    connectionIds?: string[],
    hidePreviewTypes?: boolean,
    postType?: string,
    onCreate?: (post: any) => void,
    defaultExpanded?: boolean
}

export default function PostCreator({me, connectionIds, onCreate, defaultExpanded, space, post, postType, variant, style, hidePreviewTypes, previewTypes}: PostCreatorProps) {
    const meData = useFragment(
        graphql`
            fragment PostCreatorFragment_user on User {
                ...UserIconFragment
            }
        `,
        me ? me : null
    )
    previewTypes = previewTypes ? previewTypes : defaultPreviewTypes

    variant = variant ? variant : defaultView

    const spaceData = useFragment(
        graphql`
            fragment PostCreatorFragment_space on Space {
                spaceId
                name
                ...SpaceIconFragment
            }
        `,
        space ? space : null
    )

    const postData = useFragment(
        graphql`
            fragment PostCreatorFragment_post on Post {
                postId
                type
            }
        `,
        post ? post : null
    )

    const defaultNewPost = {
        title: '',
        type: postType ? postType : 'Idea',
        delta: null,
        assignees: [],
        invitees: [],
        priority: -1,
        tags: [],
        files: [],
        media: [],
        dueDate: null,
        startDate: roundMinutes(new Date()),
        endDate: null,
        spaces: spaceData ? [{...spaceData, parentPostId: postData ? postData.postId : null, current: true}] : [],
        poll: {
            type: 'Select',
            options: [
                {
                    option: 'Option 1',
                },
                {
                    option: 'Option 2'
                }
            ]
        }
    }
    

    const [state, setState] = React.useState({
        placeholder: true,
        post: defaultNewPost,
        creating: false,
        images: [],
        files: []
    })

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (postData?.postId) {
            const spaces = state.post.spaces
            setState({
                ...state,
                post: {
                    ...state.post,
                    spaces: [{...spaces[0], parentPostId: postData.postId}, ...spaces.slice(1, spaces.length)]
                }
            })
        }
    }, [postData?.postId])

    const scrollToCreator = () => {
        setTimeout(() => {
            if (variant === 'inline') {
                scrollToWithOffset(inlineEditorId, 60, 'smooth')
            }
        }, 10)
        
    }

    const openCreator = () => {
        setState({...state, placeholder: false})
        scrollToCreator()
    }

    const quickPost = (type: string) => {
        setState({
            ...state, 
            post: {
                ...state.post,
                type
            },
            placeholder: false,
        })
        scrollToCreator()
    }

    const onChange = ({spaces, ...post}: any) => {
        setState({
            ...state,
            post: {
                ...post,
                spaces: spaceData ? (spaces.length > 0 ? spaces : state.post.spaces.slice(0, 1)) : spaces
            },
        })
    }

    const onClose = () => {
        setState({...state, placeholder: true, creating: false})
    }

    const disablePost = state.post.spaces.length === 0 || state.post.title.length === 0

    const createPost = async () => {
        if (disablePost)
            return

        if (!state.creating) {
            setState({
                ...state, 
                creating: true
            })

            const postId = uuid()
            const baseFileUrl = `post/${postId}/files/`
            const mapFiles = ({file, id, ...item}: FilePreviewItem) => {
                let extension = ''
                let splits = file!!.type.split('/')
                if (splits.length > 1) {
                    extension = splits[1].toLowerCase()
                }
                splits = file!!.name.split('.')
                if (extension.length === 0 && splits.length > 1) {
                    extension = splits[1].toLowerCase()
                }
                const link = baseFileUrl + id + (extension.length > 0 ? '.' + extension : '')
                return {...item, type: file!!.type && file!!.type.length > 0 ? file!!.type : extension, link, file}
            }

            const mapFileUploads = ({file, link}: any) => {
                return changeImage(link, file).promise()
            }
            
            
            let files: any[] = state.post.files.map(mapFiles)
            let media: any[] = state.post.media.map(mapFiles)
            const uploadFiles = files.map(mapFileUploads)
            const uploadMedia = media.map(mapFileUploads)
            files = files.map(({file, ...item}) => item)
            media = media.map(({file, ...item}) => item)
            Promise.all(uploadFiles).then(() => {
                Promise.all(uploadMedia).then(() => {
                    const attachments = [
                        ...files.map(file => ({...file, type: 'file', format: file.type})), 
                        ...media.map(file => ({...file, type: 'media', format: file.type}))
                    ]

                    const post: any = {...state.post, attachments, spaces: state.post.spaces.map(({spaceId, parentPostId}) => ({spaceId, parentPostId}))}
                    post.spaces[0].current = true;

                    delete post.files
                    delete post.media

                    commitCreatePost(
                        post,
                        connectionIds ? connectionIds : [],
                        {
                            onCompleted: (post: any) => {
                                onCreate && onCreate({postId: post.createPost.postEdge.node.postId, ...state.post})
                                setState({
                                    ...state, 
                                    creating: false,
                                    placeholder: true,
                                    post: defaultNewPost
                                })
                            },
                            onError: () => {
                                setState({
                                    ...state, 
                                    creating: false,
                                    placeholder: true,
                                    post: defaultNewPost
                                })
                            }
                        }
                    )
                })
            })
        }
    }

    const creatorOptions = (
        <div style={{height: '100%', width: '100%'}}>
            <div style={{position: 'absolute', bottom: 0, left: 10, display: 'flex', alignItems: 'center', height: '100%'}}>
                <PostAttachActions
                    onChange={(post) => setState({...state, post: ({...state.post, ...post} as any)})}
                    post={state.post}
                />
            </div>
            <Button
                startIcon={<Add/>}
                style={{float: 'right'}}
                color="primary"
                variant="contained"
                disabled={disablePost}
                onClick={createPost}
                loading={state.creating}
            >
                Create
            </Button>
        </div>
    )

    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            e.key === 'Enter' && e.ctrlKey && createPost()
        };
        document.addEventListener('keypress', onKeyPress)
        return () => document.removeEventListener('keypress', onKeyPress)
    }, [])

    return (
        <div>
            {
                (state.placeholder || variant === 'dialog') && 
                <Card style={{padding: 10, position: 'relative', ...style}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <UserIcon
                            user={meData}
                            style={{marginRight: 5}}
                            size={45}
                        />
                        <RoundedTextField
                            fullWidth
                            placeholder={`Create ${postType ? postType : 'post'}`}
                            InputProps={{
                                readOnly: true,
                                style: {height: 45}
                            }}
                            onClick={openCreator}
                        />
                    </div>
                    {
                        !hidePreviewTypes && previewTypes && 
                        <div>
                            <Divider style={{marginTop: 15, marginBottom: 10}}/>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                {
                                    previewTypes.slice(0, matches ? 2 : 3).map(pt => {
                                        const Icon = getPostIcon(pt) as any
                                        return (
                                            <ListItem button style={{paddingTop: 5, paddingBottom: 5}} onClick={() => quickPost(pt)}>
                                                <ListItemIcon style={{marginLeft: 20}}>
                                                    <Icon style={{color: getPostColor(pt)}}/>
                                                </ListItemIcon>
                                                <ListItemText
                                                    style={{marginLeft: -10}}
                                                    primary={pt}
                                                />
                                            </ListItem>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    }
                </Card>
            }
            {
                !state.placeholder && 
                <React.Fragment>
                    {
                         variant === 'dialog' ? 
                         <Dialog open onClose={onClose}>
                            <DialogTitle>
                                Create {postType ? postType : 'Post'}
                            </DialogTitle>
                            <DialogContent style={{width: 550, minHeight: 350}}>
                                <PostEditor
                                    post={state.post}
                                    onChange={onChange}
                                    postType={postType}
                                />
                            </DialogContent>
                            <DialogActions style={{position: 'relative'}}>
                                {creatorOptions}
                            </DialogActions>
                        </Dialog>
                        :
                        <Card style={{...style, position: 'relative', scrollPaddingTop: -60}} id={inlineEditorId}>
                            <CardHeader
                                title={`Create ${postType ? postType : "Post"}`}
                                titleTypographyProps={{variant: 'h6'}}
                                action={
                                    <IconButton onClick={() => setState({...state, placeholder: true})} size="small">
                                        <Close/>
                                    </IconButton>
                                }
                            />
                            <CardContent style={{position: 'relative'}}>
                                <PostEditor
                                    post={state.post}
                                    onChange={onChange}
                                    postType={postType}
                                    defaultExpanded={defaultExpanded}
                                />
                            </CardContent>
                            <CardActions style={{position: 'relative'}}>
                                {creatorOptions}
                            </CardActions>
                        </Card>
                    }
                </React.Fragment>
            }
        </div>
    )
}
