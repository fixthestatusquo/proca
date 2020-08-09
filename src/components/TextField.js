import React from "react";
import { useTranslation } from "react-i18next";
import {useLayout} from "../hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";

import { TextField } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%"
  }
}));

export default props => {
  const { t } = useTranslation();
  const layout = useLayout();
  const classes = useStyles();

  const handleBlur = (e) => {
    e.target.checkValidity();
    if (e.target.validity.valid) {
      clearError(e.target.attributes.name.nodeValue);
      return;
    }
  };
  const {errors, register, clearError} = props.form;
              // className={classes.textField}
  return (
            <TextField
              id={props.name}
              name={props.name}
              label={t(props.name)}
              inputRef={register}
              onBlur={handleBlur}
              className={classes.textField}
              error={!!(errors && errors[props.name])}
              helperText={
                errors && errors[props.name] && errors[props.name].message
              }
              variant={layout.variant}
              margin={layout.margin}
              {...props}
            />

  );
};
