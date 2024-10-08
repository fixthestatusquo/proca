import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLayout } from "@hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { Controller } from "react-hook-form";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  warning: {
    "& .Mui-error": {
      color: theme.palette.info.main,
    },
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    height: "auto!important",
    width: "100%",
  },
}));

const TextFieldProca = props => {
  const {
    formState: { errors },
    control,
    clearErrors,
    setError,
  } = props.form;

  const { t } = useTranslation();
  const layout = useLayout();
  const classes = useStyles();
  const refA = useRef();

  if (refA.current) {
    refA.current.oninvalid = e => {
      if (e.target.validity.valueMissing && props.customValidity)
        e.target.setCustomValidity(props.customValidity);
      setError(e.target.attributes.name.nodeValue, {
        type: e.type,
        message: e.target.validationMessage,
      });
    };
  }

  const handleValidate = (_value, name, dom) => {
    if (
      props.customValidity &&
      dom.hasAttribute("required") &&
      dom.value.length > 0
    ) {
      //remove the custom error message
      dom.setCustomValidity("");
    }
    dom.checkValidity();
    if (dom.validity.valid) {
      clearErrors(name); // synchronise the status to material-ui
      return true;
    }
    return dom.validationMessage;
  };

  //  const value = watch(props.name) || "";
  const validation = {
    html5: v => handleValidate(v, props.name, refA.current),
  };
  const drillProps = { ...props };
  if (props.validate) {
    validation.props = props.validate;
    delete drillProps.validate;
  }
  delete drillProps.customValidity;
  delete drillProps.onChange;
  delete drillProps.onBlur;
  delete drillProps.form;
  if (drillProps.helperText && errors && errors[props.name]) {
    // we display the error message instead
    console.log("error", errors[props.name]);
    drillProps.helperText = errors[props.name].message;
  }

  return (
    <Controller
      defaultValue=""
      render={({ field: { onChange, onBlur, value } }) => {
        let handleChange = onChange;
        let handleBlur = onBlur;
        if (props.onBlur) {
          handleBlur = e => onBlur(e) && props.onBlur(e);
        }

        if (props.onChange) {
          handleChange = async e => {
            await onChange(e);
            props.onChange(e);
          };
        }
        let classesname = `${classes.textField} proca-${props.name.toLowerCase()}`;
        if (
          errors &&
          errors[props.name] &&
          errors &&
          errors[props.name].type === "warning"
        )
          classesname += ` ${classes.warning}`;
        return (
          <TextField
            InputLabelProps={{ shrink: !!(value && value.length > 0) }}
            onChange={handleChange}
            value={value || ""}
            onBlur={handleBlur}
            className={classesname}
            error={!!(errors && errors[props.name])}
            variant={layout.variant}
            margin={layout.margin}
            inputRef={refA}
            helperText={
              errors && errors[props.name] && errors[props.name].message
            }
            {...drillProps}
          />
        );
      }}
      id={`proca_${props.name}`}
      control={control}
      rules={{
        validate: validation,
        //       required: props.required // uncomment to bypass html5 native required
      }}
      inputRef={refA}
      name={props.name}
      label={/* i18next-extract-disable-line */ t(props.name)}
    />
  );
};

export default TextFieldProca;
