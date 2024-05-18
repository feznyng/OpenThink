import { Button, Typography } from '@material-ui/core'
import {Container, Row, Col} from 'react-bootstrap';
import React from 'react'
import { useHistory } from 'react-router';

const Step = ({src, description, title}) => {
    return (
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
    )
    
}

export default function Features() {
    const history = useHistory();
    return (
        <div>
            <Typography
                variant="h3"
                style={{fontWeight: 'bold', textAlign: 'center'}}
            >
                You can make an impact
            </Typography>
            <div style={{display: 'flex', marginTop: '5vw', alignItems: 'center', justifyContent: 'center'}}>
                <Container style={{width: '100%', textAlign: 'center'}} fluid>
                    <Row>
                        <Col md={6} xs={12} lg={3} style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                            <Step
                                src={'/assets/main/network.png'}
                                description={"Be a part of the solution by sharing your ideas with the organizations you are a part of."}
                                title="Share Ideas"
                            />
                        </Col>
                        <Col md={6} xs={12} lg={3} style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                            <Step
                                src={'/assets/main/announcement.png'}
                                description={"Upvote the ideas and projects you find most meaningful."}
                                title="Use Your Voice"
                            />
                        </Col>
                        <Col md={6} xs={12} lg={3} style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                            <Step
                                src={'/assets/main/collaborate.png'}
                                description={"Work with others to turn your ideas into action."}
                                title="Collaborate"
                            />
                        </Col>
                        <Col md={6} xs={12} lg={3} style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                            <Step
                                src={'/assets/main/checkmark.png'}
                                description={"Complete action items and achieve your goals together."}
                                title="Achieve"
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10vh', marginTop: '5vw'}}>
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
