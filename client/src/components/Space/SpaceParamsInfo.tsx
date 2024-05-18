import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { accessTypes, visibilityTypes } from '../../utils/spaceutils';
import Typography from '../Shared/Typography';
import { Variant } from '@material-ui/core/styles/createTypography';
import { LocationOn } from '@material-ui/icons'
import ParamsInfoItem from './ParamsInfoItem';
interface SpaceParamsInfoProps {
    space: any,
    style?: React.CSSProperties,
    variant?: 'small' | 'medium' | 'large'
}

export default function SpaceParamsInfo({space, variant, ...props}: SpaceParamsInfoProps) {
    const {type, project, accessType, address} = useFragment(
        graphql`
            fragment SpaceParamsInfoFragment on Space {
                type
                project
                accessType
                address
            }
        `,
        space
    )

    const access = accessTypes.find(at => at.title === accessType)!!;
    const visibility = visibilityTypes.find(vt => vt.title === type)!!;
    
    const info = [
        access,
        visibility
    ]

    if (address) {
        info.push({
            title: address,
            icon: <LocationOn/>,
            desc: ''
        })
    }
    
    return (
        <div {...props}>
            {
                info.map((item) => (
                    <ParamsInfoItem
                        style={{marginTop: 15}}
                        variant={variant}
                        project={project}
                        {...item}
                    />
                ))
            }
        </div>
    )
}
