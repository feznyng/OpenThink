import { Button, Typography } from '@material-ui/core'
import { ChevronRight } from '@material-ui/icons'
import {Container, Row, Col} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';

const steps = [
    {
        description: 'Join an organization on Openthink.',
        color: "#FA369B"
    },
    {
        description: "Choose a project that interests you.",
        color: "#937DCB"
    },
    {
        description: "Sign up for tasks based on how much time you would like to commit.",
        color: "#00DAFF"
    },
    {
        description: "Attend events, share ideas, and make change! ",
        color: "#1ED780"
    }
];

export default function HowItWorks() {
    const history = useHistory();
    const {
        width
    } = useSelector((state) => state.uiActions)
    
    

    return (
        <div>
            <Typography
                variant="h3"
                style={{fontWeight: 'bold', textAlign: 'center'}}
            >
                How it works
            </Typography>
            <Container style={{width: '100%', marginTop: '5vh', marginBottom: '5vh'}} fluid>
                <Row>
                    {
                        steps.map(({description, color}, i) => (
                            <Col md={6} xs={12} lg={3} style={{display: 'flex', justifyContent: 'center', textAlign: 'center'}}>
                                <div style={{maxWidth: 300, marginRight: '2vw', marginTop: 20, display: 'flex', alignItems: 'center'}}>
                                    <div>
                                        <div
                                        >
                                            <Typography
                                                variant="h2"
                                                style={{fontWeight: 'bold', color,}}
                                            >
                                                {(i + 1).toString()}
                                            </Typography>
                                        </div>
                                        
                                        <div
                                            style={{height: 80}}
                                        >
                                            <Typography
                                                variant="body2"
                                            >
                                                {description}
                                            </Typography>
                                        </div>
                                    </div>
                                    {
                                        window.innerWidth > 994 && i !== steps.length - 1 && 
                                        <ChevronRight style={{fontSize: 50, marginLeft: '5vw'}}/>
                                    }
                                    
                                </div>
                                
                            </Col>
                        ))
                    }
                </Row>
            </Container>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8vw', marginBottom: '10vh'}}>
                <Typography
                    variant="h5"
                    style={{fontWeight: 'bold', marginRight: 20}}
                >
                    Are you ready to get started?
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    size="large"
                    style={{borderRadius: 20, textTransform: 'none'}}
                    onClick={() => history.push('/signup')}
                >
                    Join Now
                </Button>
            </div>
        </div>
    )
}
