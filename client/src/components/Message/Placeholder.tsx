import { Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';

export default function Placeholder() {
    const {
        currSpace,
    } = useSelector((state: RootState) => state.messageActions)
    return (
        <div style={{marginTop: 30, display: 'flex', justifyContent: 'center'}}>
            <div style={{maxWidth: 600}}>
                {
                    currSpace ?
                    <Typography>
                        There are no channels in {currSpace.name}. You can create one using the left hand menu.  
                    </Typography>
                    :
                    <Typography>
                        Welcome to Openthink messaging. You can reach out and get in touch with fellow changemakers to start something together! 
                    </Typography>

                }
                
            </div>
            
        </div>
    )
}
