import { usePaginationFragment, useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Divider, Link } from '@material-ui/core';
import Typography from '../Shared/Typography';
import CardTitleCount from './CardTitleCount';
import UserList, { UserListProps } from '../User/UserList';

const loadMoreCount = 10;

interface SpaceMembersProps {
    stratified?: boolean,
    space: any,
    listProps?: Partial<UserListProps>,
}

export default function SpaceMembers({stratified, space, listProps}: SpaceMembersProps) {
    const {id, permissions, ...data} = useFragment(
        graphql`
            fragment SpaceMembersFragment on Space {
                id
                permissions {
                    editUserTypes
                }
                ...SpaceMembers_moderators @include(if: $stratified)
                ...SpaceMembers_members @include(if: $stratified)
                ...SpaceMembers_followers @include(if: $stratified)
                ...SpaceMembers_invitees @include(if: $stratified)
                ...SpaceMembers_users @skip(if: $stratified)
            }
        `,
        space
    )
    
    const userInfo = usePaginationFragment(
        graphql`
            fragment SpaceMembers_users on Space      
            @refetchable(queryName: "SpaceUsersAllPaginationQuery") {
                name
                users(first: $userCount, after: $modCursor) 
                @connection(key: "SpaceMembers_users")  {       
                    __id   
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        stratified ? null : data
    )
    
    const modInfo = usePaginationFragment(
        graphql`
            fragment SpaceMembers_moderators on Space      
            @refetchable(queryName: "SpaceMembersModeratorsPaginationQuery") {
                name
                numModerators
                moderators(first: $userCount, after: $modCursor) 
                @connection(key: "SpaceMembers_moderators")  {       
                    __id   
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        stratified ? data : null
    )

    const inviteInfo = usePaginationFragment(
        graphql`
            fragment SpaceMembers_invitees on Space      
            @refetchable(queryName: "SpaceMembersInviteesPaginationQuery") {
                numInvitees
                invitees(first: $userCount, after: $modCursor) 
                @connection(key: "SpaceMembers_invitees")  {       
                    __id   
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        stratified ? data : null
    )
    
    const memberInfo = usePaginationFragment(
        graphql`
            fragment SpaceMembers_members on Space      
            @refetchable(queryName: "SpaceMembersMembersPaginationQuery") {
                name
                numMembers
                members(first: $userCount, after: $memberCursor) @connection(key: "SpaceMembers_members") {       
                    __id   
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        stratified ? data : null
    )

    const followerInfo = usePaginationFragment(
        graphql`
            fragment SpaceMembers_followers on Space      
            @refetchable(queryName: "SpaceMembersFollowersPaginationQuery") {
                numFollowers
                followers(first: $userCount, after: $memberCursor) @connection(key: "SpaceMembers_followers") {       
                    __id   
                    edges {
                        node {
                            userId
                        }
                    }
                    ...UserListFragment
                }
            }
        `,
        stratified ? data : null
    )
    
    
    const userTypes = []

    if (stratified) {
        const {moderators, numModerators} = modInfo.data;
        const {members, numMembers} = memberInfo.data;
        const {followers, numFollowers} = followerInfo.data;
        const {invitees, numInvitees} = inviteInfo.data;
        userTypes.push(
            {
                type: 'Invitees',
                userInfo: invitees,
                loadMore: () => inviteInfo.loadNext(loadMoreCount),
                count: numInvitees,
            },
            {
                type: 'Moderators',
                userInfo: moderators,
                loadMore: () => modInfo.loadNext(loadMoreCount),
                count: numModerators,
            },
            {
                type: 'Members',
                userInfo: members,
                loadMore: () => memberInfo.loadNext(loadMoreCount),
                count: numMembers,
            },
        )

        if (numFollowers > 0) {
            userTypes.push(
                {
                    type: 'Followers',
                    userInfo: followers,
                    loadMore: () => followerInfo.loadNext(loadMoreCount),
                    count: numFollowers,
                },
            )
        }
    } else {
        const {users} = userInfo.data;
        userTypes.push(
            {
                type: 'Users',
                userInfo: users,
                loadMore: () => userInfo.loadNext(loadMoreCount)
            },
        )
    }

    return (
        <div>
            {
                userTypes.map(({type, count, userInfo, loadMore}) => {
                    return (
                        <div>
                            {
                                stratified && 
                                <Divider style={{marginBottom: 15}}/>
                            }
                            {
                                stratified && 
                                <CardTitleCount
                                    title={type}
                                    count={count}
                                    typographyProps={{style: {fontSize: 16}}}
                                />
                            }
                            {
                                count === 0 &&
                                <Typography style={{marginBottom: 15}}>No {type}</Typography>
                            }
                            <UserList
                                {...listProps}
                                users={userInfo}
                                loadMore={loadMore}
                                listItemProps={{
                                    editableTypes: permissions.editUserTypes,
                                    spaceGraphId: id,
                                    location: type as any
                                }}
                            />
                        </div>
                    )
                })
            }
        </div>
    )
}
