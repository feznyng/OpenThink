import graphql from "babel-plugin-relay/macro";
import { usePaginationFragment } from "react-relay";
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@material-ui/core";
import UserListItem from "../User/UserListItem";
import InfiniteScroll from "react-infinite-scroll-component";
import Button from "../Shared/Button";
import { SearchResultsProps } from "../../pages/Search";
import { PostSearchResultsQuery } from "./__generated__/PostSearchResultsQuery.graphql";
import { PostSearchResultsFragment$key } from "./__generated__/PostSearchResultsFragment.graphql";
import PostCard from "../Post/PostCard";
import { Fragment } from "react";
import Typography from "../Shared/Typography";

export default function PostSearchResults({
  searchResults,
  style,
  shortened,
  onFilterChange,
}: SearchResultsProps) {
  const { data, hasNext, loadNext } = usePaginationFragment<
    PostSearchResultsQuery,
    PostSearchResultsFragment$key
  >(
    graphql`
      fragment PostSearchResultsFragment on RootQueryType
      @refetchable(queryName: "PostSearchResultsQuery") {
        searchPosts(query: $query, first: $postCount, after: $postCursor)
          @connection(key: "PostSearchResultsFragment_searchPosts") {
          edges {
            node {
              ...PostCardFragment
            }
          }
        }
      }
    `,
    searchResults,
  );

  const posts = data.searchPosts?.edges
    ? data.searchPosts.edges.map((e, i) => (
        <PostCard
          location="dashboard"
          post={e!!.node}
          style={{ marginBottom: 15 }}
          headerAddOn={i === 0 ? <CardHeader title={"Posts"} /> : <Fragment />}
        />
      ))
    : [];

  return (
    <div style={style}>
      <div>
        {shortened ? (
          posts
        ) : (
          <InfiniteScroll
            next={() => loadNext(10)}
            hasMore={hasNext}
            dataLength={posts?.length}
            loader={<CircularProgress />}
          >
            {posts}
          </InfiniteScroll>
        )}
      </div>
      {posts.length === 0 && <Typography>No posts found</Typography>}
      {hasNext && shortened && (
        <Card>
          <Button
            fullWidth
            onClick={() => onFilterChange("posts")}
            style={{ borderRadius: 0 }}
          >
            See all posts
          </Button>
        </Card>
      )}
    </div>
  );
}
