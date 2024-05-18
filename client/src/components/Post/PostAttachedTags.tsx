import React from 'react'
import { usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Typography from '../Shared/Typography';
import { primaryColor } from '../../theme';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { PostAttachedTagsQuery } from './__generated__/PostAttachedTagsQuery.graphql';
import { PostAttachedTagsFragment$key } from './__generated__/PostAttachedTagsFragment.graphql';

interface PostAttachedTagsProps {
    post: any,
    style?: React.CSSProperties
}

export default function PostAttachedTags({post, ...props}: PostAttachedTagsProps) {
    const {data} = usePaginationFragment<PostAttachedTagsQuery, PostAttachedTagsFragment$key>(
        graphql`
            fragment PostAttachedTagsFragment on Post @refetchable(queryName: "PostAttachedTagsQuery") {
                tags(first: $tagCount, after: $tagCursor) @connection(key: "PostAttachedTagsFragment_tags") {
                    edges {
                        node {
                            tag
                        }
                    }
                }
            }
        `,
        post
    )

    const tags = data?.tags?.edges?.map((e: any) => e.node.tag)
    const history = useHistory()

    return (
        <div {...props}>
            {
                tags && tags.length > 0 &&
                <span style={{display: 'flex', marginTop: 15, marginBottom: 10}}>
                    {
                        tags.map((t: string) => (
                            <Link style={{marginRight: 8}} to={`/tags/${t}`}>
                                #{t}
                            </Link>
                        ))
                    }
                </span>
            }
        </div>
    )
}
