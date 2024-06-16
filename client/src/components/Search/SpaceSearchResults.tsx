import React, { CSSProperties } from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment, usePaginationFragment } from "react-relay";
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@material-ui/core";
import SpaceListItem from "../Space/SpaceListItem";
import InfiniteScroll from "react-infinite-scroll-component";
import Button from "../Shared/Button";
import { SearchTypeFilter } from "./SearchFilters";
import { SpaceSearchResultsFragment_groups$key } from "./__generated__/SpaceSearchResultsFragment_groups.graphql";
import { SpaceGroupsSearchResultsQuery } from "./__generated__/SpaceGroupsSearchResultsQuery.graphql";
import { SpaceSearchResultsFragment_projects$key } from "./__generated__/SpaceSearchResultsFragment_projects.graphql";
import { SpaceProjectsSearchResultsQuery } from "./__generated__/SpaceProjectsSearchResultsQuery.graphql";
import { SearchResultsProps } from "../../pages/Search";
import Typography from "../Shared/Typography";

export default function SpaceSearchResults({
  searchResults,
  style,
  shortened,
  variant,
  onFilterChange,
}: SearchResultsProps & { variant: "Group" | "Project" }) {
  const resultData = useFragment(
    graphql`
      fragment SpaceSearchResultsFragment on RootQueryType {
        ...SpaceSearchResultsFragment_groups
        ...SpaceSearchResultsFragment_projects
      }
    `,
    searchResults,
  );

  const groupData = usePaginationFragment<
    SpaceGroupsSearchResultsQuery,
    SpaceSearchResultsFragment_groups$key
  >(
    graphql`
      fragment SpaceSearchResultsFragment_groups on RootQueryType
      @refetchable(queryName: "SpaceGroupsSearchResultsQuery") {
        searchGroups: spaces(
          first: $groupCount
          after: $groupCursor
          filters: { query: $query, project: false }
        ) @connection(key: "SpaceSearchResultsFragment_searchGroups") {
          edges {
            node {
              ...SpaceListItemFragment
            }
          }
        }
      }
    `,
    resultData,
  );

  const projectData = usePaginationFragment<
    SpaceProjectsSearchResultsQuery,
    SpaceSearchResultsFragment_projects$key
  >(
    graphql`
      fragment SpaceSearchResultsFragment_projects on RootQueryType
      @refetchable(queryName: "SpaceProjectsSearchResultsQuery") {
        searchProjects: spaces(
          first: $projectCount
          after: $projectCursor
          filters: { project: true, query: $query }
        ) @connection(key: "SpaceSearchResultsFragment_searchProjects") {
          edges {
            node {
              ...SpaceListItemFragment
            }
          }
        }
      }
    `,
    resultData,
  );

  let hasNext = groupData.hasNext;
  let loadNext = groupData.loadNext;
  let results = groupData.data.searchGroups?.edges;
  if (variant === "Project") {
    hasNext = projectData.hasNext;
    loadNext = projectData.loadNext;
    results = projectData.data.searchProjects?.edges;
  }

  const groups = results
    ? results.map((e: any) => <SpaceListItem space={e!!.node} />)
    : [];

  return (
    <Card style={style}>
      <CardHeader title={variant + "s"} />
      <CardContent>
        {shortened ? (
          groups
        ) : (
          <InfiniteScroll
            next={() => loadNext(10)}
            hasMore={hasNext}
            dataLength={groups.length}
            loader={<CircularProgress />}
          >
            {groups}
          </InfiniteScroll>
        )}
        {groups.length === 0 && (
          <Typography>No {variant + "s"} found</Typography>
        )}
      </CardContent>
      {hasNext && shortened && (
        <Button
          fullWidth
          onClick={() =>
            onFilterChange(variant === "Group" ? "groups" : "projects")
          }
          style={{ borderRadius: 0 }}
        >
          See all {variant === "Group" ? "group" : "project"} results
        </Button>
      )}
    </Card>
  );
}
