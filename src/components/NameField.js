import React from "react";
import { Controller } from "react-hook-form";
import { TextField as LayoutTextField } from "@material-ui/core";
import { useLayout } from "@hooks/useLayout";
import useData from "@hooks/useData";

export const NameField = ({ name, label, form, classes, autoComplete }) => {
  const layout = useLayout();
  const [, setData] = useData();

  const { control, formState: { errors } } = form;

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <LayoutTextField
          name={name}
          label={label}
          className={classes.textField}
          autoComplete={autoComplete}
          required
          error={!!(errors && errors[name])}
          helperText={errors && errors[name] && errors[name].message}
          variant={layout.variant}
          margin={layout.margin}
          onChange={onChange}
          onBlur={(e) => {
            setData(e.target.name, e.target.value);
            onBlur(e);
          }}
          value={value}
        />
      )}
    />
  );
};
