import React from 'react'
import {getOrganizations} from '../../actions/orgActions';
import {useDispatch} from 'react-redux';
import {Card, OutlinedInput, ClickAwayListener , IconButton, CardContent, Dialog, DialogTitle} from '@material-ui/core';
import {Search, Close} from '@material-ui/icons'
import InputAdornment from '@material-ui/core/InputAdornment';
import Popper from '@material-ui/core/Popper';
import {useHistory} from 'react-router-dom';
import SpaceListItem from '../SpaceView/SpaceListItemOld';
import TextField from '../Shared/TextField';


export default function Searchbar({small}) {
    const dispatch = useDispatch();
    const [spaces, setSpaces] = React.useState([]); 
    const [filteredSpaces, setFilteredSpaces] = React.useState([]); 
    const [value, setValue] = React.useState(''); 
    const [open, setOpen] = React.useState(false); 
    const [anchorEl, setAnchorEl] = React.useState(false); 
    const history = useHistory();

    const autocomplete = (val) => {
        let filtered = [];
        if (!val || val.length === 0) {
            setFilteredSpaces(spaces);
            return;
        }   
        for (let i = 0; i < spaces.length; i++) {
            
            if (spaces[i].name.substring(0, val.length).toUpperCase() === val.toUpperCase()) {
                filtered.push(spaces[i]);
            }
          }
          setFilteredSpaces(filtered);
    }
    
    const searchResults = (
        <CardContent>
            {
                filteredSpaces && filteredSpaces.map(s => (
                    <div style={{marginBottom: 10}}>
                        <SpaceListItem
                            space={s}
                            onClick={() => { setOpen(false); history.push({pathname: `/space/${s.space_id}`, state: {from: history.location.pathname, clear: true, push: true}})}}
                        />
                    </div>
                    
                ))
            }
        </CardContent>
    )

    return (
        <div style={{zIndex: 5000}}>
            {
                small &&
                
                <div>
                    <div  style={{marginRight: '-20px', float: 'right'}}>
                        <IconButton onClick={() => setOpen(true)}>
                            <Search/>
                        </IconButton>
                    </div>
                    
                   <Dialog fullScreen open={open} onClose={() => setOpen(false)} anchorEl={anchorEl}  style={{ width: '100%', height: '100%', zIndex: 5000}}>
                        <DialogTitle>
                            <div style={{width: '100%', marginTop: '10px'}}>
                                <IconButton onClick={() => setOpen(false)}>
                                    <Close/>
                                </IconButton>
                                <OutlinedInput 
                                    variant="outlined"
                                    value={value} 
                                    placeholder="Search..." 
                                    onChange={e => {
                                        setValue(e.target.value);
                                        autocomplete(e.target.value);
                                    }}
                                    style={{float: 'right', marginRight: '10px', height:'45px', width: '80%', borderRadius: '40px'}} 
                                    endAdornment={
                                        <InputAdornment>
                                            <Search/>
                                        </InputAdornment>
                                    }
                                    autoFocus
                                />
                            </div>
                        </DialogTitle>
                        <Card style={{width: '100%', height: "100%", overflowY: 'scroll'}}>
                            <div style={{marginTop: 20}}>
                            {searchResults}
                            </div>
                            
                        </Card>
                    </Dialog>
                   
                </div>
                
            }
            {
                !small &&
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <div style={{marginLeft: 10}}>
                        <TextField 
                            value={value} 
                            placeholder="Search..." 
                            onChange={e => {
                                setValue(e.target.value);
                                autocomplete(e.target.value);
                            }}
                            size="small"
                            onFocus={(e) => {setOpen(true); setAnchorEl(e.currentTarget); }}
                            InputProps={{
                                style: { width: open ? 200 : 140, height: 35, borderRadius: 30},
                                startAdornment: (
                                    <InputAdornment>
                                        <Search/>
                                    </InputAdornment>
                                )
                            }}
                            variant="outlined"
                        />
                        <Popper open={open} anchorEl={anchorEl}  style={{position: 'fixed', left: 0, width: '50%', height: '500px', zIndex: 10000}}>
                            <Card style={{width: '100%', height: "100%", overflowY: 'scroll'}}>
                                {searchResults}
                            </Card>
                        </Popper>
                    </div>    
                </ClickAwayListener>                           
            }
            
        </div>
    )
}
