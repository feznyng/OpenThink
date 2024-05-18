import { Button, Typography } from '@material-ui/core';
import {Container, Row, Col} from 'react-bootstrap';
import React from 'react'
import {useHistory} from 'react-router-dom';

export default function Header() {
    const history = useHistory();
    return (
        <div style={{}}>
            <Container style={{width: '100%'}} fluid>
                <Row>
                    <Col md={12} xs={12}  lg={4}>
                        <div style={{height: '100%', display: 'flex', alignItems: 'center', marginLeft: 30, marginRight: 30, marginBottom: '5vh'}}>
                        <div style={{textAlign: 'left'}}>
                            <div>
                                <Typography
                                    variant="h3"
                                    style={{marginBottom: 20, fontWeight: 'bold'}}
                                >
                                    Move forward together faster
                                </Typography>
                                <Typography
                                    variant="body2"
                                >
                                    When you bring your projects, events, and communication to Openthink’s online platform, your organization can focus on the important issues.
                                </Typography>
                            </div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disableElevation
                                    size="large"
                                    style={{marginTop: 20, borderRadius: 20, textTransform: 'none'}}
                                    onClick={() => history.push('/signup')}
                                >
                                    Sign up for Free
                                </Button>
                            </div>
                        </div>
                    </Col>
                    <Col md={12} xs={12} lg={8} style={{display: 'flex', justifyContent: 'center', alignContent: 'center', height: '100%'}}>
                        <div
                            style={{position: 'relative', width: '100%', marginBottom: '5vh'}}
                        >
                            <img
                                alt=""
                                src="/assets/organizations/group1.svg"
                                style={{maxWidth: '100%'}}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}