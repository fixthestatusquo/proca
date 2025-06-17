import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
  },
  checkboxGroup: {
    marginTop: theme.spacing(-1), // Negative margin to pull items up
  },
  checkboxLabel: {
    marginBottom: theme.spacing(-1), // Negative margin to reduce label space
    paddingTop: theme.spacing(0.5), // Small padding instead of default
    alignItems: "flex-start",
    "& .proca-MuiTypography-root": {
      lineHeight: 1.3,
      marginTop: 5, // Optional: slight adjustment to align with checkbox
    },
  },
  checkboxRoot: {
    padding: theme.spacing(0.5), // Smaller checkbox padding
  },
}));

const MultiSelectCheckbox = ({ form, name, label, options }) => {
  const classes = useStyles();

  return (
    <FormControl component="fieldset" className={classes.formControl}>
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        name={name}
        control={form.control}
        defaultValue={[]}
        render={({ field }) => (
          <FormGroup>
            {Object.entries(options).map(([key, label]) => (
              <FormControlLabel
                key={key}
                className={classes.checkboxLabel}
                control={
                  <Checkbox
                    className={classes.checkboxRoot}
                    checked={field.value.includes(key)}
                    onChange={e => {
                      const value = key;
                      const newValues = e.target.checked
                        ? [...field.value, value]
                        : field.value.filter(item => item !== value);
                      field.onChange(newValues);
                    }}
                    color="primary"
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>
        )}
      />
    </FormControl>
  );
};

export default MultiSelectCheckbox;
