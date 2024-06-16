import React from "react";
import {
  useFragment,
  useLazyLoadQuery,
  usePaginationFragment,
} from "react-relay";
import graphql from "babel-plugin-relay/macro";
import InfiniteScroll from "react-infinite-scroll-component";
import { CircularProgress } from "@material-ui/core";
import UserListItem, { UserListItemProps } from "./UserListItem";
import UserList, { UserListProps } from "./UserList";
import { SearchUserResultsQuery } from "./__generated__/SearchUserResultsQuery.graphql";
import { SearchUserResultsPaginationQuery } from "./__generated__/SearchUserResultsPaginationQuery.graphql";
import { SearchUserResultsFragment_users$key } from "./__generated__/SearchUserResultsFragment_users.graphql";

interface SearchUserResultsProps {
  space?: any;
  query: string;
  userIds?: number[];
}

export default function SearchUserResults({
  space,
  query,
  ...props
}: SearchUserResultsProps & Partial<UserListProps>) {
  const spaceData = useFragment(
    graphql`
      fragment SearchUserResults_space on Space {
        spaceId
      }
    `,
    space ? space : null,
  );

  const data = useLazyLoadQuery<SearchUserResultsQuery>(
    graphql`
      query SearchUserResultsQuery(
        $query: String!
        $searchCount: Int!
        $searchCursor: String
        $spaceId: Int
      ) {
        ...SearchUserResultsFragment_users
      }
    `,
    { query, searchCount: 20, spaceId: spaceData?.spaceId },
  );

  const usersResult = usePaginationFragment<
    SearchUserResultsPaginationQuery,
    SearchUserResultsFragment_users$key
  >(
    graphql`
      fragment SearchUserResultsFragment_users on RootQueryType
      @refetchable(queryName: "SearchUserResultsPaginationQuery") {
        searchUsers(
          excludeSpaceId: $spaceId
          first: $searchCount
          after: $searchCursor
          query: $query
        ) @connection(key: "onnectionsSearchResultsFragment_searchUsers") {
          edges {
            node {
              userId
            }
          }
          ...UserListFragment
        }
      }
    `,
    data,
  );

  const { searchUsers } = usersResult.data;

  return (
    <UserList
      {...props}
      users={searchUsers}
      loadMore={() => usersResult.loadNext(20)}
    />
  );
}
