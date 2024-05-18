import React from 'react';
import {Card, Typography, Radio} from '@material-ui/core';
export const SpaceOptionButton = ({title, toggleChecked, description, checked, children}) => {
    return (
        <Card style={{boxShadow: 'none', border: 'solid', cursor: 'pointer', borderWidth: 1, borderColor: 'lightgrey', marginTop: 10}} onClick={toggleChecked}>
            <div style={{display: 'flex', alignItems: 'center', padding: 15}}>
                <Radio
                    checked={checked}
                    style={{marginLeft: -10}}
                />
                <div style={{marginLeft: 20}}>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                    <Typography variant="p">
                        {description}
                    </Typography>
                    <div style={{marginTop: 5}}>
                        {children}
                    </div>
                </div>
               
            </div>
            
        </Card>
    )
}

export default SpaceOptionButton;