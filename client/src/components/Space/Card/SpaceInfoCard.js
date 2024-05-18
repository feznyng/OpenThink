import React from 'react'
import {Card, Typography, Link, Chip} from '@material-ui/core';

export default function InfoCard(props) {
    const {description, openDescription, tags} = props;
    const [state, setState] = React.useState({
        descLength: 100
    })
    return (
        <Card style={{textAlign: 'left', paddingBottom: 10, border: 'solid', borderWidth: 1, borderColor: 'lightgrey', boxShadow: 'none'}}>
            <Typography style={{marginLeft: '10px', marginTop: '5px'}} variant="h6">
                About
            </Typography>

            <div style={{marginLeft: "10px", marginRight: '10px', marginTop: '10px'}}>
              <div style={{marginTop: '10px'}}>
                <div>
                  <Typography gutterBottom variant="p" onClick={() => setState({...state, descLength: description.length})}>
                    {description.substring(0, state.descLength)} {(description.length > state.descLength) && <Link>...Read More</Link>}
                  </Typography>
                </div>
                <div style={{marginTop: 10}}>
                  {
                    [...tags].map((data) => 
                      (
                          <Chip
                            label={data.info}
                            key={data.space_tag_id ? data.space_tag_id : data.project_tag_id}
                            style={{margin: '1px', cursor: 'pointer'}}
                          />
                      ))
                  }
                </div>
              </div>
            </div>
            
            
        </Card>
    )
}
