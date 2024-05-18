import React from 'react'
import { Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Link, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import SkillEditor from '../Shared/SkillEditor';
import { useHistory } from 'react-router';
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { SkillsCardQuery } from './__generated__/SkillsCardQuery.graphql';
import { SkillsCardFragment$key } from './__generated__/SkillsCardFragment.graphql';
import { SkillsCardPaginationQuery } from './__generated__/SkillsCardPaginationQuery.graphql';

interface SkillsCardProps {
    user: any,
    expanded?: boolean,
    editable?: boolean,
    style?: React.CSSProperties
}

interface SkillsCardState {
    editing?: boolean,
    skills: any
}

export default function SkillsCard({user, style, expanded}: SkillsCardProps) {
    const {me} = useLazyLoadQuery<SkillsCardQuery>(
        graphql`
            query SkillsCardQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )

    const {data} = usePaginationFragment<SkillsCardPaginationQuery, SkillsCardFragment$key>(
        graphql`
            fragment SkillsCardFragment on User 
            @refetchable(queryName: "SkillsCardPaginationQuery") {
                userId
                skills(first: $skillCount, after: $skillCursor) @connection(key: "SkillsCardFragment_skills")  {
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
    const [state, setState] = React.useState<SkillsCardState>({
        editing: false,
        skills: []
    })

    const history = useHistory();
    const skills = data?.skills?.edges?.map((sk) => sk!!.node)
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
                            Skills
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
                    skills && skills.slice(0, expanded ? skills.length : 5).map((sk) => (
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
                    Edit Skills
                </DialogTitle>
                <DialogContent>
                    <SkillEditor
                        selectedSkills={skills ? skills?.map(sk => sk!!.value) : [] as any}
                        onChange={(skills: string[]) => setState({...state, skills})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({...state, skills, editing: false})}>
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
