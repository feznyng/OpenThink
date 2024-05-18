import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import UserIconBase, { UserIconBaseProps } from './UserIconBase';

export interface UserIconProps {
    user: any,
}

export default function UserIcon({user, ...props}: UserIconProps & Partial<UserIconBaseProps>) {
    const data = useFragment(
        graphql`
            fragment UserIconFragment on User {
                userId
                firstname
                lastname
                profilepic
            }
        `,
        user
    )

    return (
        <UserIconBase
            {...data}
            {...props}
        />
    )
}
