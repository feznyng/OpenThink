import React from 'react'
import Avatar from '@material-ui/core/Avatar';
import GroupIcon from '@material-ui/icons/Group'
import {getImage} from '../../actions/S3Actions';
import RocketIcon from '../Shared/RocketIcon';
import { Tooltip } from '@material-ui/core';

export default function SpaceIcon(props) {
    const {size, organization, backgroundColor, hover, color, style, showTooltip} = props;
    const [state, setState] = React.useState({
        hover: false,
      })

    const imageURL = !organization.profilepic || organization.profilepic === '' ? undefined: getImage(organization.profilepic);
    return (
        <div
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
            style={style}
        >
            <Tooltip
                title={showTooltip ? organization.name : ''}
            >
                <React.Fragment>
                    {
                        imageURL && imageURL !== '' && 
                        <Avatar 
                            src={imageURL} 
                            style={{
                                backgroundColor: backgroundColor ? backgroundColor : 'white',
                                height: size, 
                                width: size, 
                                borderRadius: hover ? 10 : 25,
                            }}
                            variant={!hover ? "rounded" : ''}
                            />
                    }

                    {
                        (!imageURL || imageURL === '') && 
                        <Avatar style={{ 
                            backgroundColor: backgroundColor ? backgroundColor : 'white',
                            width: size,
                            height: size,
                            borderRadius: hover ? 10 : 25,
                        }}
                        variant={!hover ? "rounded" : ''}
                        >
                            {
                                organization.project ? 
                                <RocketIcon
                                    style={{
                                        width: size / 1.5,
                                        height: size / 1.5,
                                        color: color ? color : 'black'
                                    }}
                                />
                                :
                                <GroupIcon
                                    style={{
                                        width: size,
                                        height: size,
                                        color: color ? color : 'black'
                                    }}
                                />
                            }
                        </Avatar>
                    
                    }
                </React.Fragment>
            </Tooltip>
        </div>
    )
    
}
