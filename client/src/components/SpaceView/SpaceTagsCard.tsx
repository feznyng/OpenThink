import { Card, CardContent, CardHeader } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePaginationFragment } from 'react-relay';
import { useHistory } from 'react-router';
import Typography from '../Shared/Typography';
import SpaceTagListItem from './SpaceTagListItem';
import { SpaceTagsCardFragment$key } from './__generated__/SpaceTagsCardFragment.graphql';
import { SpaceTagsCardPaginationQuery } from './__generated__/SpaceTagsCardPaginationQuery.graphql';

interface SpaceTagsCard {
    space: any,
    style?: React.CSSProperties,
    truncate?: boolean,
    hideIfEmpty?: boolean
}

export default function SpaceTagsCard({space, truncate, hideIfEmpty, style}: SpaceTagsCard) {
    const {data} = usePaginationFragment<SpaceTagsCardPaginationQuery, SpaceTagsCardFragment$key>(
        graphql`
            fragment SpaceTagsCardFragment on Space 
            @refetchable(queryName: "SpaceTagsCardPaginationQuery") {
                spaceId
                tags(first: $tagCount, after: $tagCursor) @connection(key: "SpaceTagsCardFragment_tags") {
                    edges {
                        node {
                            ...SpaceTagListItemFragment
                            tag
                            postCount
                            pinned
                        }
                    }
                }
            }
        `,
        space
    )

    const history = useHistory()

    return (
        <Card
            style={{...style, display: hideIfEmpty && data?.tags?.edges?.length === 0 ? 'none' : 'block'}}
        >
            <CardHeader
                title={"Tags"}
                titleTypographyProps={{variant: 'h6', style: {cursor: 'pointer'}}}
                onClick={() => truncate && history.push(`/space/${data?.spaceId}/tags`)}
            />
            <CardContent style={{marginTop: -20}}>
                {
                    data.tags?.edges && data.tags.edges.slice(0, truncate ? 5 : data.tags.edges.length).map((e) => (
                        e ? <SpaceTagListItem truncate={truncate} spaceId={data.spaceId} spaceTag={e.node}/> : <span/>
                    ))
                }
                {
                    data.tags?.edges?.length === 0 &&
                    <Typography>
                        None yet
                    </Typography>
                }
            </CardContent>
        </Card>
    )
}
