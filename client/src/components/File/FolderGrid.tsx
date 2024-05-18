import React from 'react'
import { usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { FolderGridQuery } from './__generated__/FolderGridQuery.graphql';
import { FolderGridFragment$key } from './__generated__/FolderGridFragment.graphql';
import FolderItem from './FolderItem'

interface FolderGridProps {
    drive: any
}

export default function FolderGrid({drive}: FolderGridProps) {
    const { data } = usePaginationFragment<FolderGridQuery, FolderGridFragment$key>(
        graphql`
            fragment FolderGridFragment on HasPosts @refetchable(queryName: "FolderGridQuery") {
                folders: posts(first: $folderCount, after: $folderCursor, filterTypes: ["Folder"], excludeParentTypes: $excludeParentTypes) @connection(key: "FolderGrid_folders") {
                    edges {
                        node {
                            postId
                            ...FolderItemFragment

                        }
                    }
                }
            }
        `,
        drive
    )

    return (
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {
                data.folders?.edges?.map(e => (
                    <FolderItem
                        folder={e!!.node}
                        style={{marginRight: 15, marginBottom: 15}}
                    />
                ))
            }
        </div>
    )
}
