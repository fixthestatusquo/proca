import React from "react";
import { useTranslation } from "react-i18next";
import { useLayout } from "../hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";

import { TextField } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    height: "auto!important",
    width: "100%",
  },
}));

export default (props) => {
  const { t } = useTranslation();
  const layout = useLayout();
  const classes = useStyles();

  const handleBlur = (e) => {
    e.target.checkValidity();
    if (e.target.validity.valid) {
      clearErrors(e.target.attributes.name.nodeValue);
      return;
    }
  };
  const { errors, register, clearErrors, watch } = props.form;
  const value = watch(props.name) || "";
  return (
    <TextField
      id={props.name}
      name={props.name}
      label={/* i18next-extract-disable-line */ t(props.name)}
      inputRef={register(props.register)}
      onBlur={handleBlur}
      InputLabelProps={{ shrink: value.length > 0 }}
      className={classes.textField}
      error={!!(errors && errors[props.name])}
      helperText={errors && errors[props.name] && errors[props.name].message}
      variant={layout.variant}
      margin={layout.margin}
      {...props}
    />
  );
};
