import { Card, CardContent, CardHeader, Divider, Grid } from '@material-ui/core'
import React from 'react'
import { useFragment } from 'react-relay'
import Typography from '../Shared/Typography'
import graphql from 'babel-plugin-relay/macro';
import {  Group, LocationOn, Lock, LockOpen, Person, Public, Subject, VisibilityOff } from '@material-ui/icons';
import { RocketLaunch } from '@mui/icons-material'
import { pluralize } from '../../utils/textprocessing';

/**
 * TODO:
 * - get location
 * - get interests of the group
 */

interface SpaceStatsProps {
    space: any,
    style?: React.CSSProperties
}

export default function SpaceStats({space, ...props}: SpaceStatsProps) {

    const {type, project, numUsers, numPosts, numSubgroups, numProjects} = useFragment(
        graphql`
            fragment SpaceStatsFragment on Space {
                type
                project
                numUsers
                numPosts
                numProjects: numSpaces(filters: {project: true})
                numSubgroups: numSpaces(filters: {project: false})
            }
        `,
        space
    )

    const stats = [
        {
            name: 'User',
            icon: <Person/>,
            count: numUsers
        },
        {
            name: 'Post',
            icon: <Subject/>,
            count: numPosts
        },
        {
            name: 'Subgroup',
            icon: <Group/>,
            count: numSubgroups
        },
        {
            name: 'Project',
            icon: <RocketLaunch style={{fontSize: 20}}/>,
            count: numProjects
        },
    ].filter(st => st.count > 0)


    return (
        <div {...props}>
            <Grid container alignItems="center">
                {
                    stats.map(({name, icon, count}, index) => (
                        <React.Fragment>
                            <Typography style={{fontSize: 15, marginRight: 10}}> 
                                <span style={{marginRight: 5}}>{icon}</span> {pluralize(`${count} ${name}`, count)}
                            </Typography>
                            {index < stats.length - 1 && <Divider orientation="vertical" flexItem style={{marginRight: 10}} />}
                        </React.Fragment>
                    ))
                }
            </Grid>
            
        </div>
    )
}
