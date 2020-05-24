import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
});
export default function Component (props) {
  const classes = useStyles();
  return (
        <Grid container spacing={1} alignItems="stretch">
          <Grid item  xs={12}>
            <TextField 
               label={props.label} className={classes.fullWidth} fullWidth={true} onChange={props.handleChange} value={props.text}
             InputProps ={{
              startAdornment:(<InputAdornment position="start">
              <EditIcon />
            </InputAdornment>),
            }}
             />
          </Grid>
        </Grid>
  );
}

Component.defaultProps = {
  handleChange: ()=>console.log("Warning: you should set a change event handler"),
  label: "Tweet",
};

