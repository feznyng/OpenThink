import { Button, Typography } from '@material-ui/core';
import {Container, Row, Col} from 'react-bootstrap';
import React from 'react'
import {useHistory} from 'react-router-dom';

export default function Header() {
    const history = useHistory();
    return (
        <div style={{paddingTop: '3vh'}}>
            <Container style={{width: '100%'}} fluid>
                <Row>
                    <Col md={12} xs={12} xl={7} lg={7} style={{display: 'flex', justifyContent: 'center', alignContent: 'center', height: '100%'}}>
                        <div
                            style={{position: 'relative', width: '100%', minHeight: 200}}
                        >
                           <img
                                alt=""
                                src="/assets/main/group2.svg"
                                style={{width: '100%'}}
                            />
                        </div>
                    </Col>
                    <Col md={12} xs={12}  lg={5}>
                        <div style={{height: '100%', display: 'flex', alignItems: 'center', marginLeft: 20, marginRight: 20}}>
                        <div style={{textAlign: 'left'}}>
                            <div>
                                <Typography
                                    variant="h3"
                                    style={{marginBottom: 20, fontWeight: 'bold'}}
                                >
                                    Let's change the world together
                                </Typography>
                                <Typography
                                    variant="body2"
                                >
                                    Use Openthink to stay up to date on events, volunteer easily, and become a changemaker with your favorite organizations in one place.
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
                </Row>
            </Container>
        </div>
    )
}
