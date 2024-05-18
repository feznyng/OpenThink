import { Checkbox, Collapse, Divider, Grow, ListItem } from '@material-ui/core'
import { ExpandLess, ExpandMore, FiberManualRecord } from '@material-ui/icons'
import React, { CSSProperties, useEffect, useState } from 'react'
import { useAppSelector } from '../../Store'
import { Attribute, AttributeValue } from '../../types/database'
import Button from '../Shared/Button'
import Typography from '../Shared/Typography'

interface GraphKeyProps {
    style?: CSSProperties,
    attributes: Attribute[],
    toggleAttribute: (name: string) => void
    customPrompt?: string
}

const COLLAPSED_NUM = 3;

export default function GraphKey({ style, attributes, toggleAttribute, customPrompt }: GraphKeyProps) {
    const mobile = useAppSelector(state => state.uiActions.mobile)
    const [expanded, setExpanded] = useState(!mobile)

    useEffect(() => {
        setExpanded(!mobile)
    }, [mobile])

    const message = (expanded ? 'Hide' : 'Show') + ' ' + (customPrompt ? customPrompt : 'Key')

    return (
        <div style={style}>
            {
                attributes.length > 0 && 
                <div>
                     <Collapse
                        in={expanded}
                    >              
                        <div style={{marginTop: 10, maxHeight: '30vh', overflow: 'auto'}}>
                            {
                                attributes.filter(({type}) => type === 'Checkbox').map(({name, id, color}) => (
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Checkbox
                                            style={{color, marginRight: 5, padding: 0, paddingTop: 5}}
                                            size="small"
                                            onClick={() => toggleAttribute(id!!)}
                                            defaultChecked
                                        />
                                        <Typography variant='subtitle2'>
                                            {name}
                                        </Typography>
                                    </div>
                                ))
                            }
                        </div>
                    </Collapse>
                    <Button
                        fullWidth
                        startIcon={expanded ? <ExpandMore/> : <ExpandLess/>}
                        onClick={() => setExpanded(!expanded)}
                        size="small"
                        style={{justifyContent: "flex-start", marginTop: 5}}
                    >
                        {message}
                    </Button>
                </div>
            }
        </div>
    )
}
