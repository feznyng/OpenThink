import React from 'react';
import SpaceList from '../Space/SpaceList';
import { space } from '../../types/space';
import { useFragment, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import { Card, CardHeader } from '@material-ui/core';
import { UserProjectsPaginationQuery } from './__generated__/UserProjectsPaginationQuery.graphql';
import { UserProjects_spaces$key } from './__generated__/UserProjects_spaces.graphql';
import { UserProjectsQuery } from './__generated__/UserProjectsQuery.graphql';

interface UserProjectsProps {
    queryRef: any
}
  
export default function UserProjects({queryRef}: UserProjectsProps) {
    const {user} = usePreloadedQuery<UserProjectsQuery>(
        graphql`
            query UserProjectsQuery($userId: ID!, $spaceCount: Int!, $spaceCursor: String) {
                user(userId: $userId) {
                    ...UserProjects_spaces
                }
            }
        `,
        queryRef
    )

    const {data} = usePaginationFragment<UserProjectsPaginationQuery, UserProjects_spaces$key>(
        graphql`
            fragment UserProjects_spaces on User 
            @refetchable(queryName: "UserProjectsPaginationQuery") {
                projects: spaces(first: $spaceCount, after: $spaceCursor, filters: {project: true}) @connection(key: "UserProjects_projects") {
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
                    title={"Projects"}
                    titleTypographyProps={{variant: 'h6'}}
                />
                <SpaceList
                    spaces={data?.projects}
                />
            </Card>
        </MaxWidthWrapper>
    )
  }
  