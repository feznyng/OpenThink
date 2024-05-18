import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Card, CardContent, CardHeader, CardProps, Chip } from '@material-ui/core';

interface SpaceCausesProps {
    space: any,
}

export default function SpaceCauses({space, ...props}: CardProps & SpaceCausesProps) {
    const {causes} = useFragment(
        graphql`
            fragment SpaceCausesFragment on Space {
                causes
            }
        `,
        space
    )

    return (
        <Card
            {...props}
        >
            <CardHeader
                title={'Causes'}
            />
            <CardContent>
                {
                    causes.slice(0, 5).map((c: string) => 
                        <Chip label={c}/>
                    )
                }
            </CardContent>
        </Card>
    )
}
