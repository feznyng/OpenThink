import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import { getImage } from '../../actions/S3Actions';
import { isValidHttpUrl } from '../../utils/urlutils';

interface BannerImageProps {
    data: any,
    style?: React.CSSProperties
}

export default function BannerImage({data, style}: BannerImageProps) {
    const {bannerpic, defaultBanner} = useFragment(
        graphql`
            fragment BannerImageFragment on ImageItem {
                bannerpic
                defaultBanner
            }
        `,
        data
    )

    const isUrl = isValidHttpUrl(bannerpic)

    return (
        <>
            {
                (bannerpic === null || bannerpic === '') ? 
                <img
                    alt=""
                    src={defaultBanner}
                    style={style}
                />
                :
                <img
                    alt=""
                    src={isUrl ? bannerpic : getImage(bannerpic)}
                    style={style}
                />
            }
        </>
    )
}
