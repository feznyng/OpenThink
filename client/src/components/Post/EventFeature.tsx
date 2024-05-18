import React from 'react';
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { getEventDateString } from '../../utils/dateutils';
import Typography from '../Shared/Typography';
import { KeyboardArrowDown, LocationOn, People, Schedule } from '@material-ui/icons';
import Button from '../Shared/Button';
import RSVPButton from './RSVPButton';
import InviteButton from '../Space/InviteButton';
import UserStack from '../User/UserStack';
import { isValidHttpUrl } from '../../utils/urlutils';

/**
 * TODO: 
 * - Start and end date 
 * - first ten invitees
 */

interface EventFeatureProps {
    post: any
}

export default function EventFeature({post}: EventFeatureProps) {
    const {startDate, endDate, attendees, address, invite, ...data} = useFragment(
        graphql`
            fragment EventFeatureFragment on Post {
                startDate
                endDate
                address
                attendees: users(userTypes: ["Going"], first: 10) {
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserStackFragment
                }
                invite {
                    ...RSVPButtonFragment
                }
                ...InviteButtonFragment_post
            }
        `,
        post
    )

    const start = getEventDateString(startDate, endDate)

    return (
        <div style={{display: 'flex', alignItems: 'center', width: '100%',}}>
            <div style={{width: '100%', marginRight: 10}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Schedule style={{marginRight: 10}}/>
                    <Typography>
                        {start}
                    </Typography>
                </div>
                {
                    !!address && address !== 'false' && 
                    <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                        <LocationOn style={{marginRight: 10}}/>
                        <Typography
                            clickable={isValidHttpUrl(address)}
                            onClick={() => isValidHttpUrl(address) && window.open(address, "_blank")}
                        >
                            {address}
                        </Typography>
                    </div>
                }
                {
                    attendees?.edges?.length > 0 && 
                    <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                        <People style={{marginRight: 10}}/>
                        <UserStack users={attendees} type="Attendee" showName/>
                    </div>
                }
                
            </div>
            <div>
                <RSVPButton
                    style={{float: 'right'}}
                    fullWidth
                    postUser={invite}
                />
                {
                    /*
                     <InviteButton
                        post={data}
                        fullWidth
                        style={{float: 'right', marginTop: 5}}
                        variant={'outlined'}
                    />
                    */
                }
               
            </div>
        </div>
    )
}
