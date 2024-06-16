import { Card } from "@material-ui/core";
import MaxWidthWrapper from "../components/Shared/MaxWidthWrapper";
import Typography from "../components/Shared/Typography";
import TagSubscribeButton from "../components/Tags/TagSubscribeButton";
import { usePaginationFragment, usePreloadedQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { TagPostsQuery } from "./__generated__/TagPostsQuery.graphql";
import { useHistory, useLocation, useParams } from "react-router";
import { queryString } from "../utils/urlutils";
import PostList from "../components/Post/PostList";
import { TagPostConnectionQuery } from "./__generated__/TagPostConnectionQuery.graphql";
import { TagPostsFragment$key } from "./__generated__/TagPostsFragment.graphql";
import React, { useEffect } from "react";

interface TagPostsProps {
  query: any;
}

export default function TagPosts({ query }: TagPostsProps) {
  const { numTagSpacePosts, numTagPosts, space, me, ...tagData } =
    usePreloadedQuery<TagPostsQuery>(
      graphql`
        query TagPostsQuery(
          $postCount: Int!
          $reactionCount: Int!
          $reactionCursor: String
          $postCursor: String
          $tag: String!
          $tagCount: Int!
          $tagCursor: String
          $spaceId: Int
          $includeSpace: Boolean!
        ) {
          numTagPosts(tag: $tag)
          numTagSpacePosts: numTagPosts(tag: $tag, spaceId: $spaceId)
            @include(if: $includeSpace)
          space(spaceId: $spaceId) @include(if: $includeSpace) {
            project
            name
          }
          me {
            ...TagSubscribeButtonFragment_me
          }
          ...TagSubscribeButtonFragment
          ...TagPostsFragment
        }
      `,
      query,
    );

  const { data, ...args } = usePaginationFragment<
    TagPostConnectionQuery,
    TagPostsFragment$key
  >(
    graphql`
<<<<<<< Updated upstream
      fragment TagPostsFragment on RootQueryType
=======
      fragment TagPostsFragment on Query
>>>>>>> Stashed changes
      @refetchable(queryName: "TagPostConnectionQuery") {
        tagPosts(
          first: $postCount
          after: $postCursor
          tag: $tag
          spaceId: $spaceId
        ) @connection(key: "TagPostsFragment_tagPosts") {
          edges {
            node {
              postId
            }
          }
          ...PostListFragment
        }
      }
    `,
    tagData,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const history = useHistory();

  const { tagId } = useParams<any>();

  const { search } = useLocation();

  let spaceId = queryString.parse(search)?.spaceId as string;

  return (
    <div style={{ minHeight: "90vh" }}>
      <Card
        style={{
          width: "100vw",
          height: 100,
          display: "flex",
          alignItems: "center",
          borderStartStartRadius: 0,
          borderStartEndRadius: 0,
        }}
      >
        <MaxWidthWrapper width={900}>
          <div style={{ float: "left" }}>
            <Typography variant="h6" style={{ fontSize: 30 }}>
              # {tagId}
            </Typography>
            <span style={{ display: "flex" }}>
              <Typography variant="subtitle2">
                {spaceId
                  ? `${numTagSpacePosts} posts in ${space?.name}`
                  : `${numTagPosts} post${numTagPosts!! > 1 ? "s" : ""}`}
              </Typography>
              {spaceId && (
                <React.Fragment>
                  <Typography
                    variant="subtitle2"
                    style={{ marginLeft: 5, marginRight: 5 }}
                  >
                    {`\u2022`}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    clickable
                    onClick={() => history.push(`/tags/${tagId}`)}
                  >
                    {`View All`}
                  </Typography>
                </React.Fragment>
              )}
            </span>
          </div>
          <div
            style={{
              float: "right",
              display: "flex",
              height: "100%",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <TagSubscribeButton
                size="large"
                query={tagData}
                me={me}
                tag={tagId}
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </Card>
      <div style={{ marginTop: 15 }}>
        <MaxWidthWrapper width={600}>
          <PostList
            {...args}
            posts={data.tagPosts}
            toolbarProps={{
              disabledViews: ["Graph"],
            }}
            location={"space"}
            type="query"
          />
        </MaxWidthWrapper>
      </div>
    </div>
  );
}
