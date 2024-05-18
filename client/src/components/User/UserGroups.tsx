import React from 'react';
import SpaceList from '../Space/SpaceList';
import { usePaginationFragment, usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import { Card, CardHeader } from '@material-ui/core';
import { UserGroupsPaginationQuery } from './__generated__/UserGroupsPaginationQuery.graphql';
import { UserGroupsQuery } from './__generated__/UserGroupsQuery.graphql';
import { UserGroupsFragment$key } from './__generated__/UserGroupsFragment.graphql'
interface UserGroupsProps {
    queryRef: any
}
  
export default function UserGroups({queryRef}: UserGroupsProps) {
    const {user} = usePreloadedQuery<UserGroupsQuery>(
        graphql`
            query UserGroupsQuery($userId: ID!, $spaceCount: Int!, $spaceCursor: String) {
                user(userId: $userId) {
                    ...UserGroupsFragment
                }
            }
        `,
        queryRef
    )

    const {data} = usePaginationFragment<UserGroupsPaginationQuery, UserGroupsFragment$key>(
        graphql`
            fragment UserGroupsFragment on User 
            @refetchable(queryName: "UserGroupsPaginationQuery") {
                groups: spaces(first: $spaceCount, after: $spaceCursor, filters: {project: false}) @connection(key: "UserGroups_groups") {
                    edges {
                        node {
                            spaceId
                        }
                    }
                    ...SpaceListFragment
                }
            }
        `,
        user
    )

    return (
        <MaxWidthWrapper width={600}>
            <Card>
                <CardHeader
                    title={"Groups"}
                    titleTypographyProps={{variant: 'h6'}}
                />
                <SpaceList
                    spaces={data?.groups}
                />
            </Card>
        </MaxWidthWrapper>
    )
  }
  