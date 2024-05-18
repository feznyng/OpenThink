import React, { CSSProperties } from 'react'
import { useFragment } from 'react-relay'
import BannerImage from '../Shared/BannerImage'
import SpaceIcon from '../Space/SpaceIcon'
import graphql from 'babel-plugin-relay/macro';

interface SpaceHeaderProps {
    space: any,
    bannerStyle?: CSSProperties
}

export default function SpaceHeader({space, bannerStyle}: SpaceHeaderProps) {
    const data = useFragment(
        graphql`
            fragment SpaceHeaderFragment on Space {
                ...BannerImageFragment
                ...SpaceIconFragment
            }
        `,
        space
    )

    return (
        <div style={{position: 'relative', width: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'center', ...bannerStyle}}>
                <BannerImage
                    data={data} 
                    style={{objectFit: 'cover', width: '100%', height: 250, borderEndStartRadius: 10, borderEndEndRadius: 10}} 
                />
            </div>
            <div 
            style={{
                position:'absolute',
                bottom: -30,
                left: 15,
                display: 'flex',
                alignItems: 'center'
            }}
            id="current-space-icon"
            >
            <SpaceIcon
                size={100}
                space={data}
            />
            </div>
        </div>
    )
}
