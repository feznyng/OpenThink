import { CircularProgress, Link } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router";
import Typography from "../Shared/Typography";
import {
  useFragment,
  useLazyLoadQuery,
  usePaginationFragment,
  usePreloadedQuery,
} from "react-relay";
import graphql from "babel-plugin-relay/macro";
import PostList from "../Post/PostList";
import PostCreator from "../Post/PostCreator";
import { FeedQuery } from "./__generated__/FeedQuery.graphql";

interface FeedProps {
  feed: any;
}
const Feed = ({ feed }: FeedProps) => {
  const { data, ...args } = usePaginationFragment(
    graphql`
      fragment FeedFragment on RootQueryType
      @refetchable(queryName: "FeedPaginationQuery") {
        feed(first: $feedCount, after: $feedCursor, sortBy: $sortBy)
          @connection(key: "FeedFragment_feed") {
          __id
          edges {
            node {
              postId
            }
          }
          ...PostListFragment
        }
      }
    `,
    feed,
  );

  const connectionId = data.feed.__id;

  const { me } = useLazyLoadQuery<FeedQuery>(
    graphql`
      query FeedQuery {
        me {
          ...PostCreatorFragment_user
        }
      }
    `,
    {},
  );

  const history = useHistory();

  return (
    <div>
      <PostCreator
        me={me}
        connectionIds={[connectionId]}
        style={{ marginLeft: 15, marginRight: 15, marginBottom: 15 }}
        defaultExpanded
      />
      {data.feed.edges.length === 0 && (
        <React.Fragment>
          {false ? (
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Hmm, there's nothing in your feed. Join a{" "}
              <Link onClick={() => history.push("/spaces")}>group</Link> to get
              started!
            </Typography>
          ) : (
            <Typography variant="h5" style={{ textAlign: "center" }}>
              There's nothing in your feed.
            </Typography>
          )}
        </React.Fragment>
      )}
      <PostList
        posts={data.feed}
        location={"dashboard"}
        type="query"
        toolbarProps={{
          hideViews: true,
        }}
        {...args}
      />
    </div>
  );
};

export default Feed;
