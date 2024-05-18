import { Button, Divider as BaseDivider, Link, Typography } from '@material-ui/core'
import React from 'react'

const FooterItem = ({title}) => {
    return (
        <Typography>
            {title}
        </Typography>
    )
}

const Divider = () => (
    <BaseDivider
        orientation="vertical" 
        flexItem 
        style={{marginRight: 30, marginLeft: 30}}
    />
)


export default function Footer() {
    return (
        <div style={{paddingTop: 20, paddingLeft: 30, paddingRight: 30, backgroundColor: '#F0F2F5', height: 100, position: 'relative'}} >
            <div style={{position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
                <img
                    alt=""
                    style={{height: 50}}
                    src="/assets/main/main_title.svg"
                />
            </div>
            <div style={{position: 'absolute', top: 0, right: 50, display: 'flex', alignItems: 'center', height: '100%'}}>
                <div style={{display: 'flex'}}>
                    {
                        /*
                        <FooterItem
                        title={"About"}
                        />
                        <Divider/>
                        <FooterItem
                            title={"Organizations"}
                        />
                        <Divider/>
                        <FooterItem
                            title={"Volunteer With Us"}
                        />
                        <Divider/>
                        <FooterItem
                            title={"Contact"}
                        />
                        <Divider/>
                        <FooterItem
                            title={"Help"}
                        />
                        */
                    }
                </div>
            </div>
        </div>
    )
}
