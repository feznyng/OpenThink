import React, { Fragment } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay'
import SpaceIcon, { SpaceIconProps } from './SpaceIcon';
import { Checkbox, ListItem, ListItemAvatar, IconButton, ListItemText } from '@material-ui/core';
import SpacePreviewCardWrapper from './SpacePreviewCardWrapper';
import JoinButton from './JoinButton';
import { useHistory } from 'react-router';
import Typography from '../Shared/Typography';
import SpaceFavoriteButton from './SpaceFavoriteButton';
import Link from '../Shared/Link';

export interface SpaceListItemProps {
    space: any,
    onSelect?: (spaceId: number) => void,
    selected?: boolean,
    highlighted?: boolean,
    style?: React.CSSProperties,
    hideJoin?: boolean,
    hidePreview?: boolean,
    button?: boolean,
    spaceIconProps?: Partial<SpaceIconProps>,
    canFavorite?: boolean,
    favoriteConnectionId?: string,
    onClick?: (spaceId: number) => void
}

let iconSize = 50;

export default function SpaceListItem({space, onSelect, selected, highlighted, canFavorite, onClick, favoriteConnectionId, spaceIconProps, hidePreview, hideJoin, ...props}: SpaceListItemProps) {
    const {name, spaceId, ...data} = useFragment(
        graphql`
            fragment SpaceListItemFragment on Space {
                name
                spaceId
                ...SpaceIconFragment
                ...SpacePreviewCardWrapperFragment
                ...JoinButtonFragment
                ...SpaceFavoriteButtonFragment
            }
        `,
        space
    )
    
    const history = useHistory();
    iconSize = spaceIconProps?.size ? spaceIconProps.size : iconSize
    
    return (
        <ListItem 
            {...props}
            button={!!onSelect as any || props.button}
            onClick={onClick ? () => onClick(spaceId) : () => onSelect && onSelect(spaceId)}
            style={{...props.style, position: 'relative'}}
            selected={highlighted}
        >
            {
                onSelect &&
                <Checkbox
                    checked={!!selected}
                />
            }
            <SpacePreviewCardWrapper
                space={data}
                disabled={hidePreview}
                style={{flexGrow: 0, width: '100%'}}
            >
                <span style={{display: 'flex', alignItems: 'center'}}>
                    <ListItemAvatar
                        style={{width: iconSize + 10, height: iconSize}}
                    >
                        <div
                            onClick={() => !onClick && !onSelect && history.push(`/space/${spaceId}`)}
                        >
                            <SpaceIcon
                                {...spaceIconProps}
                                size={iconSize}
                                space={data}
                            />
                        </div>
                    </ListItemAvatar>
                    <ListItemText
                        disableTypography
                        primary={
                            <Link
                                to={onSelect ? null : `/space/${spaceId}`}
                            >
                                {name}
                            </Link>
                        }
                    />
                </span>
            </SpacePreviewCardWrapper>
            {
                !onSelect &&
                <div
                    style={{marginRight: 100}}
                >
                    <div
                        style={{position: 'absolute', right: 10, top: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} 
                    >
                        {
                            !hideJoin &&  
                            <div>
                            <JoinButton
                                    space={data}
                                    size="small"
                                />
                            </div>
                        }
                        {
                            canFavorite && 
                            <SpaceFavoriteButton
                                space={data}
                                connectionId={favoriteConnectionId}
                            />
                        }
                    </div>
                </div>
            }
        </ListItem>
    )
}
