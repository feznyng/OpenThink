/* eslint-disable no-use-before-define */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {getTags} from '../../../actions/tagActions';
import TextField from '../TextField';
export default function Tags(props) {
  const {tags, name, onChange} = props;
  const [tagsArr, setTagsArr] = React.useState(tags ? tags : []);
  const [value, setValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  React.useEffect(() => {
    getTags().then(e => {
        setOptions(e);
    });
    setTagsArr(tags ? tags : []);
  }, []);

  const setTags = () => {
    setTagsArr([...tagsArr, {info: value}]);
    onChange([...tagsArr, {info: value}]);
    setValue('')
  }
  return (
    <Autocomplete
      multiple
      tagsArr={tagsArr}
      size="small"
      onChange={(event, newtagsArr) => {
        const newArr = newtagsArr.map(t => t.info ? t : ({info: t}));
        setTagsArr(newArr);
        onChange(newArr);
        setValue('')
      }}
      onBlur={() => {
        if (tagsArr.indexOf(value) < 0 && value && value.length > 0) {
          console.log('setting because of blur')
          setTags();
        }
      }}
      onKeyPress={(e) => {
        if ((e.code === 'Space' || e.code === 'Enter') && value && value.length > 0) {
          setTags();
        }
        if (e.code === 'Space') {
          e.preventDefault();
        }
      }}
      freeSolo
      options={options.filter(o => tagsArr.indexOf(o) < 0)}
      getOptionplaceholder={(option) => option}
      getOptionLabel={option => option.info}
      renderTags={(tagsArr, getTagProps) =>
        tagsArr.map((option, index) => (
          <Chip
            label={option.info}
            {...getTagProps({ index })}
          />
        ))
      }
      value={tagsArr}
      defaultValue={tags}
      style={{ width: '100%' }}
      renderInput={(params) => (
        <TextField 
          {...params } 
          value={value} 
          onChange={(e) => setValue(e.target.value.toLowerCase())} 
          placeholder={name ? name : "Tags"} 
          variant="outlined"
          size="small"
        />
      )}
    ></Autocomplete>
  );
}
