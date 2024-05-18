import { Button, Typography } from '@material-ui/core'
import {Container, Row, Col} from 'react-bootstrap';
import React from 'react'
import { useHistory } from 'react-router';

const features = [
    {
        title: 'Onboard',
        description: 'Efficiently onboard new members so they can start volunteering faster.',
        src: '/assets/organizations/onboard_icon.svg'
    },
    {
        title: 'Reach Goals',
        description: 'Post project tasks for  volunteers to complete.',
        src: '/assets/organizations/goals_icon.svg'
    },
    {
        title: 'Get Organized',
        description: 'Utilize our goal-oriented project management tools.',
        src: '/assets/organizations/organize_icon.svg'
    },
]

export default function Features() {
    const history = useHistory();
    return (
        <div style={{marginTop: '5vh', textAlign: 'center'}}>
            <Typography
                variant="h3"
                style={{fontWeight: 'bold'}}
            >
                Here to help your organization thrive
            </Typography>
            <div style={{display: 'flex', marginTop: '5vh', marginBottom: '10vh', alignItems: 'center', justifyContent: 'center'}}>
                <Container style={{width: '100%'}} fluid>
                    <Row>
                        {
                            features.map(({title, description, src}) => (
                            <Col md={12} xs={12} lg={4} style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
                                <div style={{maxWidth: 200, marginRight: '5vw', marginLeft: '5vw'}}>
                                    <img
                                        alt=""
                                        src={src}
                                        style={{height: 75, marginBottom: 20}}
                                    />
                                    <div
                                    >
                                        <Typography
                                            variant="h5"
                                            style={{fontWeight: 'bold', marginBottom: 20}}
                                        >
                                            {title}
                                        </Typography>
                                    </div>
                                    <div
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
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10vh'}}>
                <Typography
                    variant="h5"
                    style={{fontWeight: 'bold', marginRight: 20}}
                >
                    Get involved with an organization today!
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    size="large"
                    style={{borderRadius: 20, textTransform: 'none'}}
                    onClick={() => history.push('/signup')}
                >
                    Sign Up
                </Button>
            </div>
        </div>
    )
}
