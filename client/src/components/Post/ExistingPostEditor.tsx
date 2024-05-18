import React from 'react'
import { useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { ExistingPostEditorQuery } from './__generated__/ExistingPostEditorQuery.graphql';
import PostEditor from './PostEditor';
import Dialog from '../Shared/Dialog';
import { DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Button from '../Shared/Button';
import commitUpdatePost from '../../mutations/UpdatePost';
import roundMinutes, { getLocalTime } from '../../utils/dateutils';
import { Done } from '@material-ui/icons';
import { MAX_ATTRIBUTES } from '../../constants';
import { attributes } from '../Task/TaskUtils';
import { useAppDispatch } from '../../Store';
import { editPostById } from '../Task/TaskSlice';
import {FilePreviewItem} from '../File/FilePreview';
import PostAttachActions from './PostAttachActions';
import { changeImage } from '../../actions/S3Actions';
import { UpdatePostMutation$data } from '../../mutations/__generated__/UpdatePostMutation.graphql';

interface ExistingPostEditorProps {
    postId: number,
    open: boolean,
    onClose: () => void,
    parentPostId?: number | null,
    spaceId: number,
    fetchKey: string // required to force relay to retrieve up to date post information
}

export default function ExistingPostEditor({postId, fetchKey, spaceId, open, onClose}: ExistingPostEditorProps) {
    const {post} = useLazyLoadQuery<ExistingPostEditorQuery>(
        graphql`
            query ExistingPostEditorQuery($postId: ID!) {
                post(postId: $postId) {
                    id
                    postId
                    type
                    delta
                    updatedTags: tags(first: 20) {
                        edges {
                            node {
                                tag
                            }
                        }
                    }
                    completed
                    dueDate
                    endDate
                    startDate
                    title
                    type
                    latitude
                    longitude
                    address
                    priority
                    spaces(first: 20) {
                        edges {
                            node {
                                spaceId
                                name
                                ...SpaceIconFragment
                            }
                        }
                    }
                    attachments(first: 8) {
                        edges {
                            node {
                                link
                                title
                                postId
                                fileFormat
                                subtype
                            }
                        }
                    }
                    poll {
                        attribute {
                            type
                            options
                        }
                    }
                }
            }
        `,
        {postId: postId.toString()},
        {fetchPolicy: 'network-only', fetchKey}
    )

    const pollAttr = post?.poll?.attribute
    const attachments: (FilePreviewItem & {partition?: string})[] = post?.attachments?.edges ? post.attachments.edges.map(({node}: any) => ({
        id: node.postId.toString(),
        title: node.title,
        type: node.fileFormat,
        partition: node.subtype,
        postId: node.postId
    })): []

    const media = attachments.filter(({partition}) => partition === 'media')
    const files = attachments.filter(({partition}) => partition === 'file')

    const [state, setState] = React.useState({
        post: {
            postId,
            title: post?.title ? post.title : '',
            type: post?.type ? post.type : '',
            delta: post?.delta ? post.delta : '',
            spaces: post?.spaces?.edges ? post.spaces.edges.map(e => e!!.node) : [],
            dueDate: post?.dueDate ? post?.dueDate : null,
            endDate: post?.endDate ? post?.endDate : null,
            startDate: post?.startDate ? post?.startDate : roundMinutes(new Date()),
            assignees: [],
            invitees: [],
            priority: post?.priority ? post.priority : -1,
            tags: post?.updatedTags?.edges ? post?.updatedTags.edges.map(e => e!!.node!!.tag) : [],
            poll: {
                type: pollAttr?.type ? pollAttr.type : 'Select',
                options: pollAttr?.options ? pollAttr.options : [
                    {
                        option: 'Option 1',
                    },
                    {
                        option: 'Option 2'
                    }
                ]
            },
            address: post?.address ? post.address : '',
            longitude: post?.longitude ? post.longitude : null,
            latitude: post?.latitude ? post.latitude : null,
            files,
            media,
        },
        
        saving: false,
    })

    const dispatch = useAppDispatch()

    const onFinish = () => {
        onClose()
        setState({...state, saving: false})
    }
    const baseFileUrl = `post/${post!!.postId}/files/`
    const savePost = () => {
        setState({...state, saving: true})
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
        const uploadFiles = files.filter(file => !file.postId).map(mapFileUploads)
        const uploadMedia = media.filter(file => !file.postId).map(mapFileUploads)

        files = files.map(({file, ...item}) => item)
        media = media.map(({file, ...item}) => item)
        Promise.all(uploadFiles).then(() => {
            Promise.all(uploadMedia).then(() => {
                const attachments = [
                    ...files.map(file => ({...file, type: 'file', format: file.type})), 
                    ...media.map(file => ({...file, type: 'media', format: file.type}))
                ]
                commitUpdatePost(
                    {
                        ...state.post,
                        spaces: state.post.spaces.map((space) => ({spaceId: space!!.spaceId, parentPostId: (space as any).parentPostId ? (space as any).parentPostId : null})),
                        attachments,
                        files: undefined,
                        media: undefined,
                        spaceId
                    },
                    {
                        onCompleted: ({updatePost}: UpdatePostMutation$data) => {
                            const post = updatePost?.postEdge?.node
                            if (post?.postId)
                                dispatch(editPostById({postId: post.postId.toString(), post: {...post, users: post.users?.edges?.map((e: any) => e.node)}}))
                            onFinish()
                        },
                        onError: onFinish
                    }
                )
            })
        })
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                Edit Post
            </DialogTitle>
            <DialogContent style={{width: 550, minHeight: 350}}>
                <PostEditor
                    post={state.post}
                    existing
                    onChange={post => setState({...state, post})}
                />
            </DialogContent>
            <DialogActions style={{position: 'relative'}}>
                <div style={{position: 'absolute', left: 15, display: 'flex', alignItems: 'center', height: '100%'}}>
                    <PostAttachActions
                        onChange={(post) => setState({...state, post: {...state.post, ...post}})}
                        post={state.post}
                    />
                </div>
                <Button
                    onClick={savePost}
                    color="primary"
                    variant='contained'
                    loading={state.saving}
                    startIcon={<Done/>}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
