import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  makeStyles,
} from "@material-ui/core";
import { Controller } from "react-hook-form";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
  },
  radioGroup: {
    marginTop: theme.spacing(-0.5),
  },
  radioLabel: {
    marginBottom: theme.spacing(-1),
    paddingTop: theme.spacing(0.5),
    alignItems: "flex-start",
    color: theme.palette.text.primary,
    "& .proca-MuiTypography-root": {
      lineHeight: 1.3,
      marginTop: 5,
    },
  },
  radioRoot: {
    padding: theme.spacing(0.5),
  },
}));

// usage:
// <SingleSelect
//   form={form}
//   name="gender"
//   label="Select gender"
//   options={[
//     { id: "m", text: "Male" },
//     { id: "f", text: "Female" },
//     { id: "x", text: "Other", disabled: true },
//   ]}
//   getOptionLabel={opt => opt.text}
//   getOptionValue={opt => opt.id}
//   helperText="Required"
//   radioProps={{ color: "primary" }}
//   controlLabelProps={{ disabled: opt => opt.disabled }}
// />

const SingleSelect = ({
  form,
  name,
  label,
  options = [],
  row = false,
  helperText = "",
  getOptionLabel = opt => opt.label ?? opt.text ?? opt,
  getOptionValue = opt => opt.value ?? opt.id ?? opt,
  groupProps = {},
  radioProps = {},
  labelProps = {},
  controlLabelProps = {},
}) => {
  const classes = useStyles();
  const {
    control,
    formState: { errors },
  } = form;

  const hasError = !!errors[name];

  return (
    <FormControl
      component="fieldset"
      fullWidth
      margin="normal"
      error={hasError}
      className={classes.formControl}
    >
      {label && <FormLabel component="legend" {...labelProps}>{label}</FormLabel>}

      <Controller
        control={control}
        name={name}
        defaultValue=""
        render={({ field }) => (
          <RadioGroup
            {...field}
            row={row}
            className={classes.radioGroup}
            {...groupProps}
          >
            {options.map((opt, i) => {
              const value = String(getOptionValue(opt));
              const label = getOptionLabel(opt);
              const isDisabled = typeof controlLabelProps?.disabled === "function"
                ? controlLabelProps.disabled(opt)
                : controlLabelProps?.disabled;

              return (
                <FormControlLabel
                  key={i}
                  value={value}
                  className={classes.radioLabel}
                  control={
                    <Radio
                      className={classes.radioRoot}
                      {...radioProps}
                      disabled={isDisabled}
                    />
                  }
                  label={label}
                />
              );
            })}
          </RadioGroup>
        )}
      />

      {(hasError || helperText) && (
        <FormHelperText>
          {hasError ? errors[name]?.message : helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default SingleSelect;
