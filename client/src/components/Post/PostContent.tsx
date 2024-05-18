import React, { useRef, useState } from 'react'
import { Avatar, Card, CardContent, CardHeader } from '@material-ui/core'
import { useFragment, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import {TypographyProps} from '@material-ui/core'
import { useHistory } from 'react-router';
import PostAttachedTags from './PostAttachedTags';
import EventFeature from './EventFeature';
import TaskFeature from './TaskFeature';
import PollFeature from './PollFeature';
import PostContentEditor from './PostContentEditor'
import { isOverflown, scrollToWithOffset } from '../../utils/domutils';
import Button from '../Shared/Button';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

interface PostContentProps {
    post: any,
    style?: React.CSSProperties,
    collapsible?: boolean,
    hideFeatures?: string[],
    featureProps?: any
}

export default function PostContent({post, featureProps, collapsible, hideFeatures, ...props}: PostContentProps) {

    const {type, delta, postId, ...data} = useFragment(
        graphql`
            fragment PostContentFragment on Post {
                delta
                type
                body
                postId
                ...PostAttachedTagsFragment
                ...EventFeatureFragment
                ...PollFeatureFragment
                ...TaskFeatureFragment
            }
        `,
        post
    )
    const editorRef = useRef()
    const features = [
        {
            type: 'Event',
            component: <EventFeature post={data}/>
        },
        {
            type: 'Task',
            component: <TaskFeature post={data} {...featureProps}/>
        },
        {
            type: 'Poll',
            component: <PollFeature post={data}/>
        },
    ].filter(({type}) => !hideFeatures || !hideFeatures.includes(type))

    const [state, setState] = useState({
        expanded: false
    })

    const currFeature = features.find(feature => feature.type === type)

    React.useEffect(() => {
        if (editorRef.current)
            (editorRef.current as any).setContents(delta)
    }, [delta])

    const toggleContent = () => {
        const expanded = state.expanded
        setState({...state, expanded: !state.expanded})
        if (expanded) {
            // collapsing
            scrollToWithOffset(`content-${postId}`, 100)
        }
    }


    const content = document.getElementById(`content-${postId}`)
    const showOpen = content && isOverflown(content)

    return (
        <div {...props}>
            {
                (delta) && 
                <div>
                    <div style={{maxHeight: collapsible ? (state.expanded ? undefined : 300) : undefined, height: '100%', overflow: "hidden"}} id={`content-${postId}`}>
                        <PostContentEditor
                            content={delta}
                            ref={editorRef}
                            readonly
                        />
                    </div>
                    {
                        (showOpen && !state.expanded) && 
                        <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 10}}>
                            <Button 
                                variant="contained" 
                                startIcon={state.expanded ? <ExpandLess/> : <ExpandMore/>} 
                                size="small"
                                onClick={toggleContent}
                            >
                                {state.expanded ? 'Collapse' : 'Expand'}
                            </Button>
                        </div>
                        }
                </div>
            }
            <PostAttachedTags
                post={data}
            />
            {
                currFeature && 
                <div style={{marginTop: 15}}>
                    {currFeature.component}
                </div>
            }
        </div>
    )
}
