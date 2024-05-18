import React from 'react'
import InformationPostOptions from './Types/InformationPostOptions/InformationPostOptions';
import ActionPostOptions from './Types/ActionPostOptions/ActionPostOptions';
import EventPostOptions from './Types/EventPostOptions/EventPostOptions';
import PollPostOptions from './Types/PollPostOptions/PollPostOptions';

export default function PostOptions(props) {
    return (
        <div style={{marginTop: 15}}>
            {
                props.mod && (props.newPost.type === 'Information' || props.newPost.type === 'Media' || props.newPost.type === 'Link') &&
                <InformationPostOptions newPost={props.newPost} onPostChange={props.onPostChange}/>
            }
            {
                props.newPost.type === 'Action Item' || props.newPost.type === 'Task' &&
                <ActionPostOptions parent={props.parent} newPost={props.newPost} onPostChange={props.onPostChange}/>
            }
            {
                props.newPost.type === 'Event'  && 
                <EventPostOptions parent={props.parent} newPost={props.newPost} onPostChange={props.onPostChange}/>
            }
            {
                props.newPost.type === 'Poll' &&
                <PollPostOptions parent={props.parent} newPost={props.newPost} onPostChange={props.onPostChange}/>
            }
        </div>
    )
}
