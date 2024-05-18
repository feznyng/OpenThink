import React, { useState } from 'react'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { FileSystemPostQuery } from './__generated__/FileSystemPostQuery.graphql';
import FolderGrid from './FolderGrid'
import { useAppSelector } from '../../Store'
import FileList from './FileList';
import FileHeader from './FileHeader';
import { Divider } from '@material-ui/core';


const folderCount = 50

interface FileSystemProps {
    types?: string[]
    openableTypes: string[]
    openItem: (id: string) => void
    postId: string | undefined,
    spaceId: number,
}

export default function FileSystem({types, postId, spaceId}: FileSystemProps) {
    const {post, space} = useLazyLoadQuery<FileSystemPostQuery>(
        graphql`
            query FileSystemPostQuery($postId: ID, $spaceId: Int!, $inPost: Boolean!, $fileTypes: [String], $folderCount: Int!, $excludeParentTypes: [String!], $folderCursor: String, )  {
                post(postId: $postId) @include(if: $inPost) {
                    postId
                    ...FolderGridFragment
                    ...FileHeader_post
                    ...FileListFragment
                }
                space(spaceId: $spaceId) {
                    spaceId
                    ...FolderGridFragment @skip(if: $inPost)
                    ...FileListFragment @skip(if: $inPost)
                    ...FileHeader_space
                }
            }
        `,
        {postId: postId!!, spaceId, inPost: !!postId, folderCount, fileTypes: types ? types : null}
    )
    const view = useAppSelector(state => state.file.view)

    return (
        <div>
             <FileHeader
                space={space}
                post={post}
            />
            <Divider/>
            <div style={{paddingTop: 15}}>
                {
                    view === 'grid' && (!types || types.includes('Folder')) &&
                    <FolderGrid
                        drive={postId ? post : space}
                    />
                }
                <FileList
                    drive={postId ? post : space}
                />
            </div>
        </div>
    )
}
