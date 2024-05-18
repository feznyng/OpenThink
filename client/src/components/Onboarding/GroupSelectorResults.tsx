import React from 'react'
import { useHistory } from 'react-router'
import SpaceList from '../Space/SpaceList'
import { usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { useEffect } from 'react';
import { CSSProperties } from 'react';
import SpaceCreator from '../Space/SpaceCreator';
import { GroupSelectorResultsQuery } from './__generated__/GroupSelectorResultsQuery.graphql';
import { GroupSelectorResults$key } from './__generated__/GroupSelectorResults.graphql';

interface GroupSelectorResultsProps {
    root: any,
    query: string,
    style?: CSSProperties,
    creatingGroup: boolean,
    onClose: () => void
}

export default function GroupSelectorResults({root, style, onClose, creatingGroup, query}: GroupSelectorResultsProps) {
    const {data, refetch} = usePaginationFragment<GroupSelectorResultsQuery, GroupSelectorResults$key>(
        graphql`
            fragment GroupSelectorResults on Query @refetchable(queryName: "GroupSelectorResultsQuery") {
                spaces(first: $spaceCount, after: $spaceCursor filters: {query: $query}) @connection(key: "GroupSelectorResults_spaces") {
                    __id
                    edges {
                        node {
                            spaceId
                        }
                    }
                    ...SpaceListFragment
                }
            }
        `,
        root
    )
    const history = useHistory()
    const connectionId = data.spaces?.__id

    useEffect(() => {
        refetch({query})
    }, [query])

    return (
        <div>
            <SpaceList
                spaces={data.spaces}
                grid
                spaceListItemProps={{
                    onClick: (spaceId: number) => history.replace(`/get-started/spaces/${spaceId}`)
                }}
                style={style}
            />
            <SpaceCreator
                open={creatingGroup}
                onClose={onClose}
                connectionIds={connectionId ? [connectionId] : []}
                onCreate={spaceId => history.push(`/space/${spaceId}`)}
            />
        </div>
    )
}
