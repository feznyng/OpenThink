import { CardProps } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import { CSSProperties } from 'react';
import { usePreloadedQuery } from 'react-relay';
import SpaceInfoCard from '../Space/SpaceInfoCard';
import SpaceRules from '../Space/SpaceRules';
import SpaceTagsCard from './SpaceTagsCard';
import { SpaceInfoQuery } from './__generated__/SpaceInfoQuery.graphql';

interface SpaceInfoProps {
    queryRef: any,
    style?: CSSProperties,
    cardStyle?: CSSProperties,
    cardProps?: Partial<CardProps>
}

export default function SpaceInfo({queryRef, cardProps, style}: SpaceInfoProps) {
    const {space} = usePreloadedQuery<SpaceInfoQuery>(
        graphql`
            query SpaceInfoQuery($id: Int!, $tagCount: Int!, $tagCursor: String) {
                space(spaceId: $id) {
                    ...SpaceInfoCardFragment
                    ...SpaceRulesFragment
                    ...SpaceCausesFragment
                    ...SpaceTagsCardFragment
                    project
                    rules {
                        name
                    }
                }
            }
        `,
        queryRef
    )

    return (
        <div style={{paddingBottom: 20, ...style}}>
            <SpaceInfoCard
                space={space}
                {...cardProps}
            />
            {
                space?.rules && 
                <SpaceRules
                    style={{marginTop: 20, ...cardProps?.style}}
                    space={space}
                    {...cardProps}
                />
            }
            <SpaceTagsCard
                style={{marginTop: 20, ...cardProps?.style}}
                space={space}
                {...cardProps}
            />
        </div>
    )
}
