import React from 'react'
import {Accordion, Divider, AccordionActions, IconButton, AccordionDetails, AccordionSummary, Typography, TextField, CardContent} from '@material-ui/core'
import { ExpandMore, Add, Close, Edit, Done, Check } from '@material-ui/icons';
import Button from '../Shared/Button';
export default function Rules(props) {
    const {parent, onChange, canEdit, editing} = props;
    const [rules, setRules] = React.useState(parent.rules ? parent.rules : []);
    const [state, setState] = React.useState({
        addingRule: false,
    });

    const addRule = () => {
        const newRules = [...rules, {name: state.name, description: state.description}];
        setRules(newRules)
        setState({
            ...state,
            name: '',
            description: '',
        });
        onChange(newRules);
    }

    const removeRule = (rule) => {
        const newRules = rules.filter(r => rule.name !== r.name)
        setRules(newRules);
        onChange(newRules);
    }

    return (
        <div style={{textAlign: 'left'}}>
           
            <Typography variant="h6" style={{marginTop: '10px', marginLeft: canEdit ? '' : '10px'}} >Norms and Agreements</Typography>
            <div style={{marginTop: 10}}>
            {
                rules.length === 0 && canEdit && !editing &&
                <Typography variant="p">No rules </Typography>
            }
            {
                rules.map(r => (
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore/>}>{r.name}</AccordionSummary>
                        <AccordionDetails>{r.description}</AccordionDetails>
                        {
                             
                            editing && 
                            <AccordionActions>
                            <IconButton onClick={() => removeRule(r)}><Close/></IconButton>
                            </AccordionActions>
                        }
                       
                    </Accordion>
                ))
            }
            <div style={{marginTop: '10px'}}>
            {
                editing && 
                <div>
                    {
                        !state.addingRule ? 
                        <Button variant="contained" color="primary" fullWidth onClick={() => setState({...state, addingRule: true})}>
                            Add Norm/Agreement
                        </Button>
                        :
                        <Accordion expanded>
                        <AccordionSummary expandIcon={<span></span>}>
                            <TextField
                                value={state.name}
                                onChange={(e) => setState({...state, name: e.target.value})}
                                variant='outlined'
                                fullWidth
                                label="Name"
                            />    
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                value={state.description}
                                onChange={(e) => setState({...state, description: e.target.value})}
                                label="Description"
                                multiline
                                variant="outlined"
                                fullWidth
                            />
                        </AccordionDetails>
                       
                        <AccordionActions>
                            <IconButton onClick={addRule}><Check/></IconButton>
                            <IconButton onClick={() => setState({
                                ...state,
                                description: '',
                                name: '',
                                addingRule: false,
                            })}><Close/></IconButton>
                        </AccordionActions>
                        
                       
                        </Accordion>
                    }
                </div>
                
            }
            </div>
            
            </div>            
        </div>
    )
}
