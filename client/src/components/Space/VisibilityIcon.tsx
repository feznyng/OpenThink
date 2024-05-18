import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay'
import { textSecondary } from '../../theme';
import { Public, VisibilityOff } from '@material-ui/icons';

interface VisibilityIconProps {
    space: any,
    onClick?: (e: React.MouseEvent) => void
}

export default function VisibilityIcon({space, onClick}: VisibilityIconProps) {
    const {type} = useFragment(
        graphql`      
            fragment VisibilityIconFragment on Space {
                type
            }
        `,    
        space
    )

    return (
        <div onClick={onClick}>
            {
                type === 'Public' && 
                <Public style={{color: textSecondary}}/> 
            }
            {
                type === 'Private' && 
                <VisibilityOff style={{color: textSecondary}}/> 
            }
        </div>
    )
}
