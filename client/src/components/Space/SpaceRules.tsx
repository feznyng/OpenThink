import { Card, CardContent, CardHeader, Divider, IconButton } from '@material-ui/core'
import React from 'react'
import { useFragment } from 'react-relay'
import Typography from '../Shared/Typography'
import graphql from 'babel-plugin-relay/macro';
import { rule } from '../../types/space';
import { ArrowDropDown } from '@material-ui/icons';
import RuleItem from './RuleItem';

interface SpaceRulesCardProps {
    space: any,
    style?: React.CSSProperties
}

export default function SpaceRules({space, ...props}: SpaceRulesCardProps) {

    const {rules} = useFragment(
        graphql`
            fragment SpaceRulesFragment on Space {
                rules {
                    ...RuleItemFragment
                }
            }
        `,
        space
    )

    return (
        <Card
            {...props}
            style={{...props.style, paddingBottom: 20}}
        >
            <CardHeader
                title={'Rules'}
                titleTypographyProps={{variant: 'h6'}}
            />
            {
                rules && rules.map((rule: any, index: number) => (
                    <div>
                        <RuleItem
                            rule={rule}
                        />
                        {index < rules.length - 1 && <Divider style={{marginTop: 7.5, marginBottom: 7.5}}/>}
                    </div>
                    
                ))
            }
        </Card>
    )
}
