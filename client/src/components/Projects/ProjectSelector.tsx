import React, { CSSProperties } from "react";
import graphql from "babel-plugin-relay/macro";
import {
  useFragment,
  usePaginationFragment,
  usePreloadedQuery,
} from "react-relay";
import { ProjectSelectorQuery } from "./__generated__/ProjectSelectorQuery.graphql";
import Select from "../Shared/Select";
import { useHistory } from "react-router";
import SpacePreview from "../Space/SpacePreview";
import { ProjectSelectorPaginationQuery } from "./__generated__/ProjectSelectorPaginationQuery.graphql";
import { ProjectSelectorFragment$key } from "./__generated__/ProjectSelectorFragment.graphql";

/**
 * Component for choosing a project from either a space or
 */

interface ProjectSelectorProps {
  queryRef: any;
  style?: CSSProperties;
}

export default function ProjectSelector({
  queryRef,
  style,
}: ProjectSelectorProps) {
  const { space, currentProject } = usePreloadedQuery<ProjectSelectorQuery>(
    graphql`
      query ProjectSelectorQuery(
        $spaceId: Int
        $parentSpaceId: Int
        $inGroup: Boolean!
        $spaceCount: Int!
        $spaceCursor: String
      ) {
        space(spaceId: $parentSpaceId) @include(if: $inGroup) {
          spaceId
          ...ProjectSelectorFragment
        }
        currentProject: space(spaceId: $spaceId) {
          spaceId
          ...SpacePreviewFragment
        }
      }
    `,
    queryRef,
  );

  const { data } = usePaginationFragment<
    ProjectSelectorPaginationQuery,
    ProjectSelectorFragment$key
  >(
    graphql`
      fragment ProjectSelectorFragment on Space
      @refetchable(queryName: "ProjectSelectorPaginationQuery") {
        spaces(
          first: $spaceCount
          after: $spaceCursor
          filters: { project: true }
        ) @connection(key: "ProjectSelectorFragment_spaces") {
          edges {
            node {
              spaceId
              ...SpacePreviewFragment
            }
          }
        }
      }
    `,
    space!!,
  );

  const history = useHistory();

  return (
    <div style={style}>
      <Select
        value={currentProject?.spaceId}
        onChange={(e) => history.push(`/space/${e.target.value}`)}
        renderValue={() => <SpacePreview space={currentProject} />}
        variant="plain"
      >
        {data?.spaces?.edges
          ?.filter((edge) => !!edge)
          .map((edge) => (
            <SpacePreview
              space={edge!!.node}
              value={edge!!.node!!.spaceId}
              key={edge!!.node!!.spaceId}
              button
            />
          ))}
      </Select>
    </div>
  );
}
