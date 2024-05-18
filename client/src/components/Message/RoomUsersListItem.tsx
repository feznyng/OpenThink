import { ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import { FiberManualRecord } from '@material-ui/icons'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import { useFragment } from 'react-relay'
import UserIcon from '../User/UserIcon'
import UserPreviewCardWrapper from '../User/UserPreviewCardWrapper'

const RoomUsersListItem = ({user}: {user: any}) => {
    const {firstname, lastname, active, ...data} = useFragment(
        graphql`
            fragment RoomUsersListItem on User {
                firstname
                lastname
                active
                ...UserPreviewCardWrapperFragment
                ...UserIconFragment
            }
        `,
        user
    )

    const [state, setState] = React.useState<{
        hover: boolean,
    }>({
        hover: false,
    })

    
    return (
        <div>
            <UserPreviewCardWrapper
                user={data}
            >
                <ListItem
                    button
                    style={{height: 45, opacity: (user.active || state.hover) ? 1.0 : 0.5}}
                >
                    <div style={{position: 'relative'}}>
                        <ListItemAvatar>
                            <UserIcon
                                user={data}
                                size={35}
                            />
                        </ListItemAvatar>
                        <FiberManualRecord fontSize="small" style={{position: 'absolute', bottom: -5, right: 10, color: active ? green[500] : 'grey'}}/>
                    </div>
                    <ListItemText
                        primary={`${firstname} ${lastname}`}
                        primaryTypographyProps={{variant: 'subtitle1'}}
                    />
                </ListItem>
            </UserPreviewCardWrapper>
        </div>
       
    )
}
export default RoomUsersListItem;