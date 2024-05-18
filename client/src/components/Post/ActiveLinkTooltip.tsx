import { IconButton, Popper, Tooltip, PopperProps, PopoverProps, Popover, Paper, Snackbar } from '@material-ui/core'
import { Close, Edit, LinkOff } from '@material-ui/icons'
import { ContentCopy } from '@mui/icons-material'
import React, { Fragment, MouseEvent } from 'react'

/**
 * TODO:
 * - Add link preview (favicon, title, truncated description, domain)
*/

const iconProps: any = {size: 'small'}

interface ActiveLinkTooltipProps {
    link: string,
    removeLink: (e: MouseEvent) => void,
    editLink: (e: MouseEvent) => void
}

export default function ActiveLinkTooltip({link, removeLink, editLink, ...props}: ActiveLinkTooltipProps & Omit<PopperProps, 'children'>) {
    const [state, setState] = React.useState({
        open: false
    })

    const copyLink = () => {
        navigator.clipboard.writeText(link)
        setState({...state, open: true})
    }

    const close = () => setState({...state, open: false})

    const linkActions = [
        {
            name: 'Copy link',
            icon: <ContentCopy {...iconProps}/>,
            onClick: copyLink
        },
        {
            name: 'Edit link',
            icon: <Edit {...iconProps}/>,
            onClick: editLink
        },
        {
            name: 'Remove link',
            icon: <LinkOff {...iconProps}/>,
            onClick: removeLink
        }
    ]

    return (
        <Fragment>
            <Popper
                {...props}
                placement='top-start'
                style={{...props.style, zIndex: 100000}}
                onMouseDown={e => e.preventDefault()}
            >
                <Paper style={{padding: 10}}>
                    <a rel="noopener noreferrer nofollow" target="_blank" href={link}>{link}</a>
                    <div style={{display: 'flex', alignItems: 'center', marginTop: 5}}>
                        {
                            linkActions.map(({icon, name, onClick}) => (
                                <Tooltip title={name}>
                                    <IconButton size="small" onClick={onClick}>
                                        {icon}
                                    </IconButton>
                                </Tooltip>
                            ))
                        }
                    </div>
                </Paper>
            </Popper>
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              open={state.open}
              autoHideDuration={4000}
              onClose={close}
              message="Link copied to clipboard"
              action={
                <React.Fragment>
                  <IconButton size="small" color="inherit" onClick={close}>
                    <Close fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
        </Fragment>
    )
}
