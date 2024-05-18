import React, { CSSProperties } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { AccessTime } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import { primaryColor } from '../../theme';
import { getNowDateDiff, timeAgo } from '../../utils/dateutils';

const timeThreshold = 3

interface LastUpdatedTagProps {
    space: any,
    style?: CSSProperties
}

export default function LastUpdatedTag({space, style}: LastUpdatedTagProps) {
    const { lastUpdatedAt, currUser } = useFragment(
        graphql`
            fragment LastUpdatedTagFragment on Space {
                lastUpdatedAt
                currUser {
                    accepted
                }
            }
        `,
        space
    )

    const date = lastUpdatedAt ? new Date(lastUpdatedAt) : null
    let show = (date && currUser.accepted && (getNowDateDiff(date) / 3.6e+6) < timeThreshold)

    return (
        <div style={{...style, visibility: show ? 'visible' : 'hidden', backgroundColor: primaryColor, display: 'flex', alignItems: 'center', borderEndStartRadius: 10}}>
            <AccessTime style={{color: 'white', marginRight: 5, fontSize: 15}}/>
            <Typography style={{color: 'white', fontSize: 12}}>
                Updated {timeAgo.format(new Date(lastUpdatedAt))}
            </Typography>
        </div>
    )
}
