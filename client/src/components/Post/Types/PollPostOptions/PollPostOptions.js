import React from 'react'
import { 
    Button,
    CardHeader,
    TextField,
    Card
} from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { Close, Add } from '@material-ui/icons';
export default function PollPostOptions(props) {
    const [state, setState] = React.useState({

    })
    return (
        <div>
            <div style={{marginBottom: '10px'}}>
                {
                    props.newPost.info.poll.map(i => (
                        <Card style={{marginBottom: '1px'}}>
                            <CardHeader
                                title={i.option}
                                action={
                                    <IconButton onClick={() => {props.onPostChange({
                                            ...props.newPost,
                                            info: {
                                                ...props.newPost.info,
                                                poll: props.newPost.info.poll.filter(p => p.option !== i.option)
                                            }
                                        
                                        })}}>
                                        <Close/>
                                    </IconButton>
                                }
                            />
                        </Card>
                    ))
                }
            </div>
            
            {
                state.addingPoll ? 
                <div style={{display: 'flex'}}>
                    <TextField
                        value={state.pollBody}
                        placeholder={'Option...'}
                        variant="outlined"
                        autoFocus
                        onChange={e => setState({...state, pollBody: e.target.value})}
                    />
                    <IconButton onClick={() => {
                        setState({
                            ...state, 
                            pollBody: '',
                        });
                        props.onPostChange({
                            ...props.newPost,
                            info: {
                                ...props.newPost.info,
                                poll: [...props.newPost.info.poll, {option: state.pollBody, votes: 0}]
                            }
                        });
                    }}>
                        <Add/>
                    </IconButton>
                    <IconButton onClick={() => setState({
                        ...state,
                        pollBody: '',
                        addingPoll: false,
                    })}>
                        <Close/>
                    </IconButton>
                </div>
                
                :
                <Button variant="outlined" style={{marginTop: '10px'}} onClick={() => {
                    setState({
                        ...state, 
                        addingPoll: true,
                    })
                }}>
                Create Poll Option
                </Button>

            }
            
        </div>
    )
}
