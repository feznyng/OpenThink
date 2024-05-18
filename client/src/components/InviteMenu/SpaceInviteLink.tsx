import React, { useState } from 'react'
import { useFragment, useRefetchableFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import TextField from '../Shared/TextField';
import Button from '../Shared/Button';
import Typography from '../Shared/Typography';
import { ContentCopy } from '@mui/icons-material';
import { Done } from '@material-ui/icons';

interface SpaceInviteLinkProps {
    space: any
}

let copiedTimer: null | ReturnType<typeof setTimeout> = null

export default function SpaceInviteLink({space}: SpaceInviteLinkProps) {
    const [{inviteLink}, refetch] = useRefetchableFragment(
        graphql`
            fragment SpaceInviteLinkFragment on Space @refetchable(queryName: "SpaceInviteLinkQuery") {
                inviteLink(type: "Member") 
            }
        `,
        space
    )

    const [copied, setCopied] = useState(false)
    const link = window.location.origin + '/invite/' + inviteLink 

    const copyLink = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        copiedTimer && clearTimeout(copiedTimer)
        copiedTimer = setTimeout(() => setCopied(false), 3000)
    }

    return (
        <div>
            <Typography variant='h6'>
                Invite Link
            </Typography>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <TextField
                    size="small"
                    InputProps={{
                        readOnly: true
                    }}
                    value={link}
                    fullWidth
                />
                <Button 
                    size='small'
                    variant='contained'
                    color='primary'
                    onClick={copyLink}
                    style={{marginLeft: 5, width: 100}}
                    startIcon={copied ? <Done/> : <ContentCopy/>}
                >
                    {copied ? 'Copied' : 'Copy'}
                </Button>
            </div>
        </div>
    )
}
