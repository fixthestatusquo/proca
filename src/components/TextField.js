import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLayout } from "@hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import {  Controller } from "react-hook-form";


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

const TextFieldProca = (props) => {
  const { t } = useTranslation();
  const layout = useLayout();
  const classes = useStyles();
  const ref = useRef();

  const handleValidate = (value, name, dom) => {
    dom.checkValidity();
    if (dom.validity.valid) {
      clearErrors(name); // synchronise the status to material-ui
      return true;
    }
    return dom.validationMessage;
  };

  const { errors, control, clearErrors, watch } = props.form;
  const value = watch(props.name) || "";

  let validation = {
         html5: (v) => handleValidate(v,props.name,ref.current),
  };
  if (props.validate) 
    validation.props = props.validate;

  return (
    <Controller
    defaultValue=""
    as ={TextField}
      id={"proca_" + props.name}
    inputRef={ref}
    control = {control}
     rules= {{ 
       validate: validation,
//       required: props.required // uncomment to bypass html5 native required 
     }}
      name={props.name}
      label={/* i18next-extract-disable-line */ t(props.name)}
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

export default TextFieldProca;
