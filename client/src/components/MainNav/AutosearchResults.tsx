import React, { Fragment, useEffect, useState } from "react";
import {
  useLazyLoadQuery,
  usePaginationFragment,
  usePreloadedQuery,
} from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { AutosearchResultsQuery } from "./__generated__/AutosearchResultsQuery.graphql";
import { AutosearchGroupsResultsQuery } from "./__generated__/AutosearchGroupsResultsQuery.graphql";
import { AutosearchResults_groups$key } from "./__generated__/AutosearchResults_groups.graphql";
import SpaceListItem from "../Space/SpaceListItem";
import { useHistory } from "react-router";
import Typography from "../Shared/Typography";

interface AutosearchResultsProps {
  query: string;
  closeResults: () => void;
}

export default function AutosearchResults({
  query,
  closeResults,
}: AutosearchResultsProps) {
  const results = useLazyLoadQuery<AutosearchResultsQuery>(
    graphql`
      query AutosearchResultsQuery(
        $query: String!
        $groupNum: Int!
        $groupCursor: String
      ) {
        ...AutosearchResults_groups
      }
    `,
    { query, groupNum: 20 },
  );

  const { data } = usePaginationFragment<
    AutosearchGroupsResultsQuery,
    AutosearchResults_groups$key
  >(
    graphql`
      fragment AutosearchResults_groups on RootQueryType
      @refetchable(queryName: "AutosearchGroupsResultsQuery") {
        searchGroups: spaces(
          first: $groupNum
          after: $groupCursor
          filters: { query: $query, excludeChildren: true, project: false }
        ) @connection(key: "AutosearchResults_searchGroups") {
          __id
          edges {
            node {
              spaceId
              ...SpaceListItemFragment
            }
          }
        }
      }
    `,
    results,
  );
  const history = useHistory();
  const [selected, setSelected] = useState<null | number>(null);
  const spaces = data.searchGroups?.edges;
  const length = spaces ? spaces.length : 0;

  useEffect(() => {
    function arrowKeyHandler(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown":
          if (selected == null) {
            setSelected(0);
          } else {
            setSelected((selected + 1) % length);
          }
          break;
        case "ArrowUp":
          if (!selected) {
            setSelected(length - 1);
          } else {
            let newVal = (selected - 1) % length;
            if (newVal < 0) {
              newVal = length - newVal;
            }
            setSelected(selected - 1);
          }
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (selected != null) {
            console.log(
              "here",
              `/space/${spaces!![selected]!!.node!!.spaceId}`,
            );
            spaces &&
              history.push(`/space/${spaces[selected]!!.node!!.spaceId}`);
            closeResults();
          }
      }
    }

    document.addEventListener("keydown", arrowKeyHandler);

    return () => {
      document.removeEventListener("keydown", arrowKeyHandler);
    };
  }, [selected]);

  useEffect(() => {
    setSelected(null);
  }, [data]);

  return (
    <div>
      {spaces && (
        <Fragment>
          {length > 0 ? (
            spaces.map((e, i) => (
              <SpaceListItem
                space={e!!.node!!}
                hideJoin
                hidePreview
                button
                onClick={() => {
                  history.push(`/space/${e?.node?.spaceId}`);
                  closeResults();
                }}
                highlighted={selected === i}
              />
            ))
          ) : (
            <Typography style={{ textAlign: "center" }}>
              No groups found
            </Typography>
          )}
        </Fragment>
      )}
    </div>
  );
}
