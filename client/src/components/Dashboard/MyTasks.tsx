import { Card, Typography } from '@material-ui/core';
import React from 'react'
import { useHistory } from 'react-router-dom';
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button';
import { MyTasksFragment$key } from './__generated__/MyTasksFragment.graphql'
import PostListItem from '../Post/PostListItem';
import Link from '../Shared/Link';

interface MyTasksProps {
    me: any
    style?: React.CSSProperties
}

const MyTasks = ({style, me}: MyTasksProps) => {
    const { quickTasks } = useFragment<MyTasksFragment$key>(
        graphql`
            fragment MyTasksFragment on User {
                quickTasks: posts(first: 5, includeAssigned: true, filterTypes: ["Task"], sortBy: "New") {
                    edges {
                        node {
                            ...PostListItemFragment
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
            }
        `,
        me
    )

    const history = useHistory();

    return (
        <div style={{...style}}>
            <div style={{paddingBottom: 15, textAlign: 'left'}}>
                <div style={{paddingLeft: 15, paddingTop: 15, paddingBottom: 10}}>
                    <Link
                        style={{marginBottom: 10, cursor: 'pointer'}} 
                        to={'/my-tasks'}
                        typographyProps={{variant: 'h6'}}
                        defaultStyle
                    >
                        My Tasks
                    </Link>
                </div>
                {
                    quickTasks?.edges && quickTasks.edges.length === 0 &&
                    <Typography style={{padding: 15}}>
                        You have no upcoming quickTasks.
                    </Typography>
                }
                {
                     quickTasks?.edges && quickTasks.edges.map(e => (
                        <PostListItem
                            post={e!!.node!!}
                            iconProps={{
                                dynamic: true
                            }}
                        />
                    ))
                }
            </div>
            {
                quickTasks?.pageInfo.hasNextPage &&
                <Button onClick={() => history.push('/my-quickTasks')} fullWidth>
                    See All
                </Button>
            }
        </div>
        
    )
}


export default MyTasks