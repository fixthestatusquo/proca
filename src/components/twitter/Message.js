import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
//import TextField from '@material-ui/core/TextField';
import TextField from '@components/TextField';
import Grid from '@material-ui/core/Grid';
import { useTranslation } from "react-i18next";

import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
});
export default function TwitterMessage (props) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
        <Grid container spacing={1} alignItems="stretch">
          <Grid item  xs={12}>
            <TextField
    name="message"
               form={props.form}
               label={props.label || t("Your message")}
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

TwitterMessage.defaultProps = {
  handleChange: ()=>console.log("Warning: you should set a change event handler")
};

