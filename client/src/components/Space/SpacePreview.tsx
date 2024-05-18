import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpaceIcon from './SpaceIcon'
import { truncate as truncateString } from '../../utils/textprocessing';
import Typography from '../Shared/Typography';
import { IconProps, ListItem, ListItemIcon, ListItemProps, ListItemText, TypographyProps } from '@material-ui/core';

interface SpacePreviewProps extends ListItemProps {
    space: any,
    truncate?: boolean,
    titleProps?: Partial<TypographyProps>,
    iconProps?: Partial<IconProps>,
    subtitle?: string
}

export default function SpacePreview({ space, titleProps, iconProps, truncate, subtitle, ...listItemProps }: SpacePreviewProps) {
    const { spaceId, name, ...data } = useFragment(
        graphql`
            fragment SpacePreviewFragment on Space {
                ...SpaceIconFragment
                spaceId
                name
            }
        `,
        space
    )

        
    return (
        <ListItem
            {...listItemProps as any}
        >
            <ListItemIcon>
                <SpaceIcon
                    size={30}
                    {...iconProps}
                    space={data}
                    style={{...iconProps?.style}}
                />
            </ListItemIcon>
            <ListItemText
                primaryTypographyProps={titleProps}
                primary={truncate ? truncateString(name, 15) : name}
                secondary={subtitle}
            />
        </ListItem>
    )
}
