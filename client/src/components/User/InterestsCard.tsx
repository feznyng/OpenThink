import React from 'react'
import { Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Link, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import SkillEditor from '../Shared/SkillEditor';
import { useHistory } from 'react-router';
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { InterestsCardQuery } from './__generated__/InterestsCardQuery.graphql';
import { InterestsCardFragment$key } from './__generated__/InterestsCardFragment.graphql';
import { InterestsCardPaginationQuery } from './__generated__/InterestsCardPaginationQuery.graphql';
import TopicEditor from '../Shared/TopicEditor';

interface InterestsCardProps {
    user: any,
    expanded?: boolean,
    editable?: boolean,
    style?: React.CSSProperties
}

interface InterestsCardState {
    editing?: boolean,
    interests: any
}

export default function InterestsCard({user, expanded, style}: InterestsCardProps) {
    const {me} = useLazyLoadQuery<InterestsCardQuery>(
        graphql`
            query InterestsCardQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )

    const {data} = usePaginationFragment<InterestsCardPaginationQuery, InterestsCardFragment$key>(
        graphql`
            fragment InterestsCardFragment on User 
            @refetchable(queryName: "InterestsCardPaginationQuery") {
                userId
                interests(first: $skillCount, after: $skillCursor) @connection(key: "InterestsCardFragment_interests")  {
                    edges {
                        node {
                            value
                        }
                    }
                }
            }
        `,
        user
    )
    const [state, setState] = React.useState<InterestsCardState>({
        editing: false,
        interests: []
    })

    const history = useHistory();
    const interests = data?.interests?.edges?.map((sk) => sk!!.node)
    const pathname = history.location.pathname

    const saveChanges = () => {

    }

    return (
        <Card style={{width: "100%", textAlign: 'left', ...style}} onClick={() => history.push(pathname + (pathname.slice(pathname.length - 1, pathname.length) === '/' ? '' : '/') + 'about')}>
            <CardHeader
                title={ 
                    <div>
                        <Typography
                            variant="h6"
                            style={{float: 'left', fontSize: 22, fontWeight: 'bold'}}
                        >
                            Interests
                        </Typography>
                        {
                            !expanded && 
                            <Link style={{float: 'right'}}>
                                See All
                            </Link>
                        }
                       
                    </div>
                    
                }
                // action={expanded && me.userId === data.userId && <IconButton onClick={() => setState({...state, editing: true})}><Edit/></IconButton>}
            />
            <CardContent style={{marginTop: -20}}>
                {
                    interests && interests.slice(0, expanded ? interests.length : 5).map((sk) => (
                        <Chip
                            style={{marginRight: 10, marginBottom: 10}}
                            label={sk!!.value}
                            color="primary"
                        />
                    ))
                }
            </CardContent>
            <Dialog open={!!state.editing}>
                <DialogTitle>
                    Edit Interests
                </DialogTitle>
                <DialogContent>
                    <TopicEditor
                        selectedTopics={interests ? interests?.map(sk => sk!!.value) : [] as any}
                        type={'Interest'}
                        onChange={(interests: string[]) => setState({...state, interests})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({...state, interests, editing: false})}>
                        Cancel
                    </Button>
                    <Button color="primary" variant="contained" onClick={saveChanges}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}
