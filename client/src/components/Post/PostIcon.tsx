import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import PostIconBase, { PostIconBaseProps } from './PostIconBase';
import Typography from '../Shared/Typography';
import { Checkbox } from '@material-ui/core';

export interface PostIconProps extends Partial<PostIconBaseProps> {
    post: any,
    dynamic?: boolean,
    fontSize?: 'small' | 'medium' | 'large'
}

export default function PostIcon({post, fontSize = 'medium', dynamic, ...props}: PostIconProps ) {
    const data = useFragment(
        graphql`
            fragment PostIconFragment on Post {
                type
                icon
                color
                completed
                dueDate
                startDate
            }
        `,
        post
    )

    let size = 25
    if (fontSize === 'small') size = 20
    if (fontSize === 'large') size = 30

    if (dynamic) {
        switch(data.type) {
            case 'Event':{
                const date = new Date(data.startDate)
                const day = date.getDate()
                const month = date.getMonth() + 1
                return (
                    <div style={{position: 'relative'}}>
                        <Typography variant="subtitle2" color="textPrimary">
                            {month} / {day}
                        </Typography>
                    </div>
                )
            }
            case 'Task':
                return (
                    <Checkbox
                        checked={!!data.completed}
                    />
                )
        }
    }

    return (
        <PostIconBase {...data} {...props} style={{...props.style}}/>
    )
}
