import { Button, Typography } from '@material-ui/core';
import {Container, Row, Col} from 'react-bootstrap';
import React from 'react'
import {useHistory} from 'react-router-dom';


const features = [
    {
        title: 'Mission',
        description: 'We provide the best tools for organizations to collaborate with activists to efficiently implement change in the world. ',
        src: '/assets/organizations/onboard_icon.svg'
    },
    {
        title: 'Vision',
        description: 'We envision a world where activists and organizations can work together seamlessly to solve important issues.',
        src: '/assets/organizations/goals_icon.svg'
    },
    {
        title: 'Purpose',
        description: 'We aim to provide a transparent and accessible space for ideas, projects, and events to come to life.',
        src: '/assets/organizations/organize_icon.svg'
    },
]

export default function About() {
    const history = useHistory();
    return (
        <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: '3vh', textAlign: 'center'}}>
            <div style={{height: '100%', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{textAlign: 'center', display: 'flex', alignItems: 'center'}}>
                    <div>
                        <Typography
                            variant="h3"
                            style={{marginBottom: 20, fontWeight: 'bold'}}
                        >
                            We’re here to help you change the world
                        </Typography>
                        <Typography
                            variant="body2"
                            style={{maxWidth: 800}}
                        >
                            Our online platform serves as an interactive database that facilitates open collaboration and solution-based discussion. Organizations can coordinate ideas, actions, events, and projects, as well as network with allied groups to work towards shared goals and objectives.

                        </Typography>
                        <Typography
                            variant="body2"
                            style={{maxWidth: 800, marginTop: 20}}
                        >

                            By crowdsourcing ideas on a single platform with a forum structure, Openthink serves as a hub for discussion to turn ideas into reality.
                        </Typography>
                        <img
                            alt=""
                            src="/assets/main/rectangle.png"
                            style={{width: '100%', maxHeight: 15, marginTop: 50}}
                        />
                    </div>
                    
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '5vw', marginBottom: '5vw'}}>
                <Container style={{width: '100%',}} fluid>
                    <Row>
                        {
                            features.map(({title, description, src}) => (
                            <Col md={12} xs={12} lg={4} style={{display: 'flex', justifyContent: 'center'}}>
                                <div style={{marginRight: '1vw', marginLeft: '5vw'}}>
                                    <div
                                    >
                                        <Typography
                                            variant="h5"
                                            style={{marginTop: 20, fontWeight: 'bold'}}
                                        >
                                            {title}
                                        </Typography>
                                    </div>
                                    <div
                                        style={{minHeight: 100, marginTop: 10}}
                                    >
                                        <Typography
                                            variant="body2"
                                        >
                                            {description}
                                        </Typography>
                                    </div>
                                
                                </div>
                            </Col>
                            ))
                        }
                    </Row>
                </Container>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                <img
                    alt=""
                    src="/assets/main/rectangle.png"
                    style={{width: '100%', maxHeight: 15, marginBottom: 50, maxWidth: 800}}
                />
            </div>
        </div>
    )
}
