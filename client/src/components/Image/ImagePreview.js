import React from 'react'
import {GridList, GridListTile} from '@material-ui/core'
export default function ImagePreview(props) {
    const {images} = props;

    return (
        <div>
           <img style={{width: '100%', objectFit: 'contain'}} src={images[0]} alt={''} />
        </div>
    )
}
