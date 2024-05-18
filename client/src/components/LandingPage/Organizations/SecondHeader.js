
import { Button, Typography } from '@material-ui/core'
import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router';

export default function SecondHeader() {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const history = useHistory();

    const content1 = (
        <div  style={{height: '100%'}}>
            <img
                alt=""
                src="/assets/organizations/hands_joined.svg"
                style={{maxWidth: '100%'}}
            />
        </div>
    );

    const content2 = (
        <div style={{textAlign: 'left', display: 'flex', alignItems: 'center', height: '100%'}}>
            <div>
                <div>
                    <Typography
                        variant="h3"
                        style={{marginBottom: 20, fontWeight: 'bold'}}
                    >
                        Collaborate with other organizations
                    </Typography>
                    <Typography
                        variant="body2"
                    >
                        Message other organization leaders directly to plan events and projects with common goals using our project management features.
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    size="large"
                    style={{marginTop: 20, borderRadius: 20, textTransform: 'none'}}
                    onClick={() => {
                        history.push('/spaces');
                        window.scrollTo(0, 0)
                    }}
                >
                    Discover groups
                </Button>
            </div>
        </div>
    )
    return (
        <div style={{marginLeft: 30, marginRight: 30}}>
            <Container style={{width: '100%'}} fluid>
                <Row>
                    <Col md={12} xs={12} lg={8} style={{display: 'flex', justifyContent: 'center', alignContent: 'center', height: '100%'}}>
                        {matches ? content1 : content2}
                    </Col>
                    <Col md={12} xs={12}  lg={4}>
                        {matches ? content2 : content1}
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
