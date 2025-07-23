import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from "@material-ui/core";
import { Controller } from "react-hook-form";

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
    >
      {label && <FormLabel {...labelProps}>{label}</FormLabel>}

      <Controller
        control={control}
        name={name}
        defaultValue=""
        render={({ field }) => (
          <RadioGroup {...field} row={row} {...groupProps}>
            {options.map((opt, i) => {
              const value = String(getOptionValue(opt));
              const label = getOptionLabel(opt);
              return (
                <FormControlLabel
                  key={i}
                  value={value}
                  control={<Radio {...radioProps} />}
                  label={label}
                  {...controlLabelProps}
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
