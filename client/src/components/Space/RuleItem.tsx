import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay'
import Typography from '../Shared/Typography'
import { ArrowDropDown } from '@material-ui/icons';
import { IconButton, ListItem } from '@material-ui/core'
import { Collapse } from 'react-bootstrap';
import DropDownButton from '../Shared/DropDownButton';

interface RuleItemProps {
    rule: any
}

const openTime = 250; // time it takes to open the rule's description

export default function RuleItem({rule}: RuleItemProps) {
    const {name, description} = useFragment(
        graphql`
            fragment RuleItemFragment on Rule {
                name
                description
            }
        `,
        rule
    )

    const [state, setState] = React.useState({
        open: false,
    })

    return (
        <div
            style={{cursor: 'pointer'}}
        >
            <ListItem 
                button
                onClick={() => setState({...state, open: !state.open})}
                style={{position: 'relative', width: "100%"}}
            >
                <div style={{width: '100%'}}>
                    <div style={{position: 'relative', width: "100%"}}>
                        <Typography
                            variant='h6'
                            style={{fontSize: 16}}
                        >
                            {name}
                        </Typography>
                        <div
                            style={{position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}
                        >
                            <DropDownButton
                                timeout={openTime}
                                open={state.open}
                            />
                        </div>
                    </div>
                    <Collapse
                        in={state.open}
                        timeout={openTime}
                    >
                        <div
                            style={{marginTop: 10}}
                        >
                            <Typography>
                                {description}
                            </Typography>
                        </div>
                    </Collapse>
                </div>
            </ListItem>
        </div>
    )
}
