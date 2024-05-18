import { Typography } from '@material-ui/core';
import React from 'react';
import { space } from '../../types/space';
import SpaceIcon from '../Space/SpaceIconOld';
interface SpaceListItemProps {
    space: space,
    onClick?: () => void
}

export default function SpaceListItem(props: SpaceListItemProps) {
    const {
        space,
        onClick
    } = props;
    return (
        <div
            style={{cursor: onClick ? 'pointer' : '', display: 'flex', alignItems: 'center'}}
            onClick={onClick}
        >
            
            <span style={{marginRight: 15}}>
                <SpaceIcon
                    organization={space}
                    size={30}
                />  
            </span>
            <Typography>
                {`${space.name}`}
            </Typography>
            <Typography variant={"caption"} color="textSecondary" style={{marginLeft: 5}} >
                {'- Group ' + (space.tags && space.tags[0] && space.tags[0].info ? `\u25AA ${space.tags[0].info}` : ``)}
            </Typography>
        </div>
    )
}
