import React from 'react'
import { usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { FileListQuery } from './__generated__/FileListQuery.graphql';
import { FileListFragment$key } from './__generated__/FileListFragment.graphql';
import { useAppSelector } from '../../Store';

interface FileListProps {
    drive: any
}

export default function FileList({drive}: FileListProps) {
    const { data } = usePaginationFragment<FileListQuery, FileListFragment$key>(
        graphql`
            fragment FileListFragment on HasPosts @refetchable(queryName: "FileListQuery") {
                files: posts(first: $folderCount, after: $folderCursor, filterTypes: $fileTypes, excludeParentTypes: $excludeParentTypes) @connection(key: "FileList_files") {
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
    
    const view = useAppSelector(state => state.file.view)

    return (
        <div>
            
        </div>
    )
}
