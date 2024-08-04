/* eslint-disable no-use-before-define */
import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import PostIcon from "./PostIcon";
import { Group } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 500,
    "& > * + *": {
      marginTop: theme.spacing(3),
    },
  },
}));

type Props = {
  placeholder: string;
  posts: any[];
  onChange: (post: any[]) => void;
  multiple?: boolean;
  style?: React.CSSProperties;
};

export default function PostAutocomplete({
  placeholder,
  posts,
  onChange,
  multiple,
  style,
}: Props) {
  const classes = useStyles();

  console.log(posts);

  return (
    <div className={classes.root} style={style}>
      <Autocomplete
        multiple={multiple}
        options={posts}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" placeholder={placeholder} />
        )}
        renderOption={(option) => (
          <React.Fragment>
            <span style={{ marginRight: 5 }}>
              {option.alt ? (
                <img
                  src={option.alt}
                  alt=""
                  style={{ width: 30, height: 30 }}
                />
              ) : (
                <Group style={{ width: 30, height: 30 }} />
              )}
            </span>
            {option.label}
          </React.Fragment>
        )}
        onChange={(ev, val) => {
          onChange(multiple ? val : [val]);
        }}
      />
    </div>
  );
}
