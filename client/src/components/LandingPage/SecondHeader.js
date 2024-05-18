
import { Button, Typography } from '@material-ui/core'
import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router';

export default function SecondHeader() {
    const theme = useTheme();
    const history = useHistory();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const content1 = (
        <div  style={{height: '100%', width: '100%', marginTop: matches ? 0 : 20}}>
             <img
                alt=""
                src="/assets/main/group.svg"
                style={{maxWidth: '100%', float: 'right'}}
            />
        </div>
    );

    const content2 = (
        <div style={{textAlign: 'left', display: 'flex', alignItems: 'center', height: '100%', marginLeft: 20, marginRight: 20}}>
            <div>
                <div>
                    <Typography
                        variant="h3"
                        style={{marginBottom: 20, fontWeight: 'bold'}}
                    >
                        Find organizations that share your values
                    </Typography>
                    <Typography
                        variant="body2"
                    >
                        Openthink is working with organizations that take on the issues you care about. Find your dream organization and co-create meaningful change.
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
        <div>
            <Container style={{width: '100%'}} fluid>
                <Row>
                    <Col md={12} xs={12} lg={5}>
                        {matches ? content2 : content1}
                    </Col>
                    <Col md={12} xs={12}  lg={7} style={{display: 'flex', justifyContent: 'center', alignContent: 'center', height: '100%'}}>
                        {matches ? content1 : content2}
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
