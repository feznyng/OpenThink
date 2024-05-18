import React from 'react';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import UserIcon from '../User/UserIconOld';
import Typography from '@material-ui/core/Typography';
import {getUsers} from '../../actions/userActions';
import store from '../../Store';
function UserTag(props) {
  const {user} = props;
  return (
    <div style={{display: 'flex', marginLeft: 0, marginRight: 0}}>
      <span style={{marginLeft: '-5px'}}>
      <UserIcon  size="25px" user={user} readonly/>
      </span>
      <Typography style={{marginLeft: '2px'}}>{user.firstname} {user.lastname}</Typography>
    </div>
  )
}


export default function PeopleAutocomplete(props) {
  const {people, defaultValue, name, onChange, placeholder, invalidOptions, size} = props;
  const [peopleArr, setPeopleArr] = React.useState([]);
  const [value, setValue] = React.useState([]);
  const [options, setOptions] = React.useState([]);
  const currUser = store.getState().userActions.userInfo;
  React.useEffect(() => {
    if (!people) {
      getUsers().then(users => {
        setOptions(users.filter(u => u.user_id !== currUser.user_id));
      })
    } else {
      setOptions(people);
      
    }
    setPeopleArr(defaultValue);
  }, [people])
  return (
    <Autocomplete
      style={{width: '100%'}}
      multiple
      id="fixed-people-demo"
      onChange={(event, newpeopleArr) => {
        setPeopleArr(newpeopleArr);
        onChange(newpeopleArr);
      }}
      options={options.filter(p => 
          !defaultValue.find(e => e.user_id === p.user_id) && 
          (!invalidOptions || !invalidOptions.find(e => e.user_id === p.user_id)) &&
          !(peopleArr.find(e => e.user_id === p.user_id))
        )}
      getOptionLabel={(user) => `${user.firstname} ${user.lastname}`}
      value={peopleArr}
      size="small"
      renderOption={(people) => (<UserTag user={people}/>)}
      renderTags={(peopleArr, getTagProps) =>
        peopleArr.map((option, index) => (
          <Chip
            size="small"
            label={
            <UserTag user={option}/>
            }
            {...getTagProps({ index })}
          />
        ))
      }
      size="small"
      renderInput={(params) => (
        <TextField {...params } style={{width: '100%', maxWidth: '100%', overflow: 'auto'}} placeholder={placeholder ? placeholder : 'Invitees'} inputProps={{...params.inputProps,}} onChange={(e) => setValue(e.target.value)} variant="outlined"/>
      )}
    ></Autocomplete>
  );
}
