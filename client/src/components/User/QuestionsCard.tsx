import React from 'react'
import { connection, user } from '../../types/user'
import ImageList from '@material-ui/core/ImageList';
import { Button, Card, CardHeader, Typography } from '@material-ui/core';
import { post } from '../../types/post';
interface QuestionsCardProps {
    questions: post[]
}

export default function QuestionsCard(props: QuestionsCardProps) {
    const {
        questions
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
                            Questions
                        </Typography>
                    </div>
                    
                }
            />
           
        </Card>
    )
}
