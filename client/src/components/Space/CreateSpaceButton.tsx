import { ButtonProps } from '@material-ui/core'
import { GroupAdd } from '@material-ui/icons'
import React, { Suspense } from 'react'
import Button from '../Shared/Button'
import SpaceCreator, { SpaceCreatorProps } from './SpaceCreator'

interface CreateSpaceButtonProps {
    style?: React.CSSProperties
}

export default function CreateSpaceButton({...props}: CreateSpaceButtonProps & Partial<SpaceCreatorProps>) {
    const [state, setState] = React.useState({
        creating: false,
    })

    return (
        <React.Fragment>
            <Button
                style={props.style}
                variant='contained'
                color='primary'
                startIcon={<GroupAdd/>}
                onClick={() => setState({...state, creating: true})}
            >
                Create
            </Button>
            {
                state.creating && 
                <Suspense
                    fallback={<div/>}
                >
                    <SpaceCreator
                        {...props}
                        open={state.creating}
                        onClose={() => setState({...state, creating: false})}
                    />
                </Suspense>
                
            }
        </React.Fragment>
    )
}
