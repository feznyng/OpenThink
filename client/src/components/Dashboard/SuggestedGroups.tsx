import { Card } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router";
import Typography from "../Shared/Typography";
import SpaceList from "../Space/SpaceList";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay";
import { SuggestedGroupsFragment$key } from "./__generated__/SuggestedGroupsFragment.graphql";
import Button from "../Shared/Button";
import Link from "../Shared/Link";

interface SuggestedGroupsProps {
  style?: React.CSSProperties;
  root: any;
}

const SuggestedGroups = ({ style, root, ...props }: SuggestedGroupsProps) => {
  const { recommendedGroups } = useFragment<SuggestedGroupsFragment$key>(
    graphql`
      fragment SuggestedGroupsFragment on RootQueryType {
        recommendedGroups(first: 6) {
          edges {
            node {
              spaceId
            }
          }
          ...SpaceListFragment
        }
      }
    `,
    root,
  );

  const history = useHistory();

  return (
    <div style={{ ...style }}>
      <div style={{ paddingBottom: 15, textAlign: "left" }}>
        <div style={{ paddingLeft: 15, paddingTop: 15, paddingBottom: 10 }}>
          <Link
            style={{ marginBottom: 10, cursor: "pointer" }}
            to={"/spaces"}
            typographyProps={{ variant: "h6" }}
            defaultStyle
          >
            Suggested Groups
          </Link>
        </div>
      </div>
      {recommendedGroups?.edges?.length === 0 && (
        <Typography style={{ padding: 15 }}>No more suggestions.</Typography>
      )}
      <SpaceList spaces={recommendedGroups} maxLength={5} />
      <Button onClick={() => history.push("/spaces")} fullWidth>
        See All
      </Button>
    </div>
  );
};

export default SuggestedGroups;
