
import { Button, Card, CardHeader, Typography } from '@material-ui/core';
import { post } from '../../types/post';
interface UserEventsProps {
    events: post
}

export default function UserEvents(props: UserEventsProps) {
    const {
        events
    } = props;
    return (
        <Card style={{width: "100%", textAlign: 'left'}}>
            <CardHeader
                title={ 
                    <div>
                        <Typography
                            variant="h6"
                            style={{float: 'left', fontSize: 22, fontWeight: 'bold'}}
                        >
                            Events
                        </Typography>
                    </div>
                    
                }
            />
           
        </Card>
    )
}
