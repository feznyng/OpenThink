import React from 'react';
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button';

interface PollSelectorProps {
    poll: any,
    onSelect: (option: any) => void
}

export default function PollSelector({poll, onSelect}: PollSelectorProps) {
    const {attribute} = useFragment(
        graphql`
            fragment PollSelectorFragment on Poll {
                attribute {
                    options 
                }
            }
        `,
        poll
    )

    return (
        <div>
            {
                attribute.options.map((option: any) => (
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth 
                        style={{marginTop: 5}}
                        onClick={() => onSelect(option)}
                    >
                        {option.option}
                    </Button>
                ))
            }
        </div>
    )
}
