import {
  Collapse,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@material-ui/core";
import React, { CSSProperties, Fragment, useState } from "react";
import { SidebarGroupsQuery } from "./__generated__/SidebarGroupsQuery.graphql";
import { SidebarSpacesGroupsFragment$key } from "./__generated__/SidebarSpacesGroupsFragment.graphql";
import { SidebarProjectsQuery } from "./__generated__/SidebarProjectsQuery.graphql";
import { SidebarSpacesProjectsFragment$key } from "./__generated__/SidebarSpacesProjectsFragment.graphql";
import SpaceListItem from "../Space/SpaceListItem";
import Button from "../Shared/Button";
import { ExpandMore, Star } from "@material-ui/icons";
import { useHistory } from "react-router";
import DropDownButton from "../Shared/DropDownButton";
import { Groups, RocketLaunch } from "@mui/icons-material";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import commitReorderSpaces from "../../mutations/ReorderSpaces";
import { objectOrderUpdater } from "../../utils/spaceutils";
import { SidebarSpacesFavoritesFragment$key } from "./__generated__/SidebarSpacesFavoritesFragment.graphql";
import { SidebarFavoritesQuery } from "./__generated__/SidebarFavoritesQuery.graphql";
import { SidebarSpacesReorderFavoritesMutation } from "./__generated__/SidebarSpacesReorderFavoritesMutation.graphql";
import graphql from "babel-plugin-relay/macro";
import { useFragment, usePaginationFragment, useMutation } from "react-relay";

interface SidebarSpacesProps {
  user: any;
  style?: CSSProperties;
}

export default function SidebarSpaces({ user, style }: SidebarSpacesProps) {
  const { id, ...data } = useFragment(
    graphql`
      fragment SidebarSpacesFragment on User {
        id
        ...SidebarSpacesGroupsFragment
        ...SidebarSpacesProjectsFragment
        ...SidebarSpacesFavoritesFragment
      }
    `,
    user,
  );

  const [state, setState] = useState({
    open: ["Groups", "Projects", "Favorites"],
  });

  const favoriteData = usePaginationFragment<
    SidebarFavoritesQuery,
    SidebarSpacesFavoritesFragment$key
  >(
    graphql`
      fragment SidebarSpacesFavoritesFragment on User
      @refetchable(queryName: "SidebarFavoritesQuery") {
        favorites(first: $spaceCount, after: $favoriteCursor, type: "spaces")
          @connection(key: "SidebarSpacesFragment_favorites") {
          __id
          edges {
            node {
              id
              space {
                id
                spaceId
                ...SpaceListItemFragment
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
    data,
  );

  const groupData = usePaginationFragment<
    SidebarGroupsQuery,
    SidebarSpacesGroupsFragment$key
  >(
    graphql`
      fragment SidebarSpacesGroupsFragment on User
      @refetchable(queryName: "SidebarGroupsQuery") {
        groups: spaces(
          first: $spaceCount
          after: $groupCursor
          filters: { project: false }
        ) @connection(key: "SidebarSpacesFragment_groups") {
          __id
          edges {
            node {
              id
              spaceId
              ...SpaceListItemFragment
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
    data,
  );

  const projectData = usePaginationFragment<
    SidebarProjectsQuery,
    SidebarSpacesProjectsFragment$key
  >(
    graphql`
      fragment SidebarSpacesProjectsFragment on User
      @refetchable(queryName: "SidebarProjectsQuery") {
        projects: spaces(
          first: $spaceCount
          after: $projectCursor
          filters: { project: true }
        ) @connection(key: "SidebarSpacesFragment_projects") {
          __id
          edges {
            node {
              id
              spaceId
              ...SpaceListItemFragment
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
    data,
  );

  const spaces = [
    {
      title: "Favorites",
      icon: <Star />,
      spaces: favoriteData.data.favorites?.edges?.map(
        (e) => e!!.node!!.space!!,
      ),
      hasNext: favoriteData.data.favorites?.pageInfo?.hasNextPage,
      loadNext: () => favoriteData.loadNext(5),
    },
    {
      title: "Groups",
      icon: <Groups />,
      spaces: groupData.data.groups?.edges?.map((e) => e!!.node!!),
      hasNext: groupData.data.groups?.pageInfo?.hasNextPage,
      loadNext: () => groupData.loadNext(5),
    },
    {
      title: "Projects",
      icon: <RocketLaunch />,
      spaces: projectData.data.projects?.edges?.map((e) => e!!.node!!),
      hasNext: projectData.data.projects?.pageInfo.hasNextPage,
      loadNext: () => projectData.loadNext(5),
    },
  ];

  const history = useHistory();

  const [commitReorderFavorites] =
    useMutation<SidebarSpacesReorderFavoritesMutation>(graphql`
      mutation SidebarSpacesReorderFavoritesMutation(
        $input: SpaceOrderChange!
      ) {
        reorderSpaceFavorites(input: $input) {
          id
          index
        }
      }
    `);

  const onDragEnd = (result: DropResult, type: string) => {
    const { source, destination } = result;
    const sourceIndex = source.index;
    const destIndex = destination?.index;
    if ((destIndex || destIndex === 0) && sourceIndex !== destIndex) {
      const spaceId = parseInt(result.draggableId);
      if (type === "Favorites") {
        const favoriteId = favoriteData.data.favorites?.edges?.find(
          (e) => e?.node?.space?.spaceId === spaceId,
        )?.node?.id;

        commitReorderFavorites({
          variables: {
            input: {
              spaceId,
              oldIndex: sourceIndex,
              newIndex: destIndex,
            },
          },
          optimisticUpdater: (store: any) =>
            favoriteId &&
            objectOrderUpdater(
              store,
              favoriteId,
              sourceIndex,
              destIndex,
              favoriteData.data.favorites!!.__id,
            ),
          updater: (store: any) =>
            favoriteId &&
            objectOrderUpdater(
              store,
              favoriteId,
              sourceIndex,
              destIndex,
              favoriteData.data.favorites!!.__id,
            ),
        });
      } else {
        onReorder(spaceId, sourceIndex, destIndex, type);
      }
    }
  };

  const onReorder = (
    spaceId: number,
    oldIndex: number,
    newIndex: number,
    type: string,
  ) => {
    commitReorderSpaces({
      variables: {
        input: {
          spaceId,
          oldIndex,
          newIndex,
        },
      },
      optimisticUpdater: (store: any) =>
        updateSpaces(store, spaceId, oldIndex, newIndex, type),
      updater: (store: any) =>
        updateSpaces(store, spaceId, oldIndex, newIndex, type),
    });
  };

  const updateSpaces = (
    store: any,
    spaceId: number,
    oldIndex: number,
    newIndex: number,
    type: string,
  ) => {
    if (type === "Projects" && projectData.data.projects?.__id) {
      const space_graphql_id = projectData.data.projects?.edges?.find(
        (e) => e?.node?.spaceId === spaceId,
      )?.node?.id;
      space_graphql_id &&
        objectOrderUpdater(
          store,
          space_graphql_id,
          oldIndex,
          newIndex,
          projectData.data.projects.__id,
        );
    } else if (groupData.data.groups?.__id) {
      const space_graphql_id = groupData.data.groups?.edges?.find(
        (e) => e?.node?.spaceId === spaceId,
      )?.node?.id;
      space_graphql_id &&
        objectOrderUpdater(
          store,
          space_graphql_id,
          oldIndex,
          newIndex,
          groupData.data.groups.__id,
        );
    }
  };

  return (
    <div style={{ ...style, paddingBottom: 15 }}>
      {spaces.map(({ title, spaces, hasNext, icon, loadNext }, index) => {
        const open = state.open.includes(title);
        return (
          <div key={title}>
            <MenuItem
              style={{
                paddingLeft: 15,
                paddingRight: 15,
                marginTop: open && index > 0 ? 15 : 0,
              }}
              onClick={() =>
                setState({
                  ...state,
                  open: open
                    ? state.open.filter((section) => section != title)
                    : [...state.open, title],
                })
              }
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={title} />
              <DropDownButton open={open} />
            </MenuItem>
            <Collapse in={open}>
              <Fragment>
                <DragDropContext
                  onDragEnd={(result) => onDragEnd(result, title)}
                >
                  <Droppable
                    droppableId="droppable"
                    type="droppableItem"
                    direction="vertical"
                  >
                    {(provided) => (
                      <div ref={provided.innerRef}>
                        {spaces?.map(({ spaceId, ...s }, index) => (
                          <Draggable
                            key={spaceId}
                            draggableId={spaceId.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => {
                                  history.push(`/space/${spaceId}`);
                                  window.scrollTo(0, 0);
                                }}
                              >
                                <SpaceListItem
                                  space={s}
                                  hideJoin
                                  spaceIconProps={{
                                    size: 35,
                                  }}
                                  hidePreview
                                  button
                                  canFavorite
                                  favoriteConnectionId={
                                    favoriteData.data.favorites?.__id
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                {hasNext && (
                  <div style={{ paddingLeft: 15, paddingRight: 15 }}>
                    <Button
                      fullWidth
                      startIcon={<ExpandMore />}
                      onClick={loadNext}
                    >
                      More
                    </Button>
                  </div>
                )}
              </Fragment>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
}
