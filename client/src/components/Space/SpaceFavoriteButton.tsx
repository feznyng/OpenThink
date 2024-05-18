import React, { MouseEvent } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, useMutation } from 'react-relay'
import { IconButton } from '@material-ui/core';
import { Star, StarOutline } from '@mui/icons-material';
import { SpaceFavoriteButtonMutation } from './__generated__/SpaceFavoriteButtonMutation.graphql';

interface SpaceFavoriteButtonProps {
    space: any,
    connectionId?: string
}

export default function SpaceFavoriteButton({space, connectionId}: SpaceFavoriteButtonProps) {
    const {favorite, spaceId} = useFragment(
        graphql`
            fragment SpaceFavoriteButtonFragment on Space {
                favorite
                spaceId
            }
        `,
        space
    )

    const [commitToggleFavorite] = useMutation<SpaceFavoriteButtonMutation>(
        graphql`
            mutation SpaceFavoriteButtonMutation($input: FavoriteSpaceInput!, $connections: [ID!]!) {
                toggleFavoriteSpace(input: $input) {
                    deletedFavoriteId @deleteEdge(connections: $connections)
                    space {
                        id
                        favorite
                    }
                    favoriteSpaceEdge @appendEdge(connections: $connections) {
                        node {
                            id
                            space {
                                spaceId
                                ...SpaceListItemFragment
                            }
                        }
                    }
                }
            }
        `
    )

    const toggleFavorite = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        commitToggleFavorite({
            variables: {
                input: {
                    spaceId,
                    favorite: !favorite
                },
                connections: connectionId ? [connectionId] : []
            }
        })
    }

    return (
        <IconButton onClick={toggleFavorite} disableRipple>
           {favorite ? <Star/> : <StarOutline/>}
        </IconButton>
    )
}
