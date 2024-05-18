import { Card, Typography } from '@material-ui/core';
import React, { Fragment } from 'react'
import { useHistory } from 'react-router-dom';
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button';
import { MyEventsFragment$key } from './__generated__/MyEventsFragment.graphql'
import PostListItem from '../Post/PostListItem';
import Link from '../Shared/Link';

interface MyEventsProps {
    me: any
    style?: React.CSSProperties
}

const MyEvents = ({style, me}: MyEventsProps) => {
    const { events } = useFragment<MyEventsFragment$key>(
        graphql`
            fragment MyEventsFragment on User {
                events: posts(first: 5, includeAssigned: true, filterTypes: ["Event"], sortBy: "New") {
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
                        to={'/my-events'}
                        typographyProps={{variant: 'h6'}}
                        defaultStyle
                    >
                        My Events
                    </Link>
                </div>
                {
                    events?.edges && events.edges.length === 0 &&
                    <Typography style={{padding: 15}}>
                        You have no upcoming events.
                    </Typography>
                }
                {
                     events?.edges && events.edges.map(e => (
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
                events?.pageInfo.hasNextPage &&
                <Button onClick={() => history.push('/my-events')} fullWidth>
                    See All
                </Button>
            }
        </div>
        
    )
}


export default MyEvents