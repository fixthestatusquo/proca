import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  checkboxGroup: {
    marginTop: theme.spacing(-1), // Negative margin to pull items up
  },
  checkboxLabel: {
    marginBottom: theme.spacing(-1), // Negative margin to reduce label space
    paddingTop: theme.spacing(0.5), // Small padding instead of default
    alignItems: "flex-start",
    color: theme.palette.text.primary,
    "& .proca-MuiTypography-root": {
      lineHeight: 1.3,
      marginTop: 5, // Optional: slight adjustment to align with checkbox
    },
  },
  checkboxRoot: {
    padding: theme.spacing(0.5, 0.5, 0.5, 2.5),
    "& input": {
      height: "auto!important",
    },
  },
  helperText: {
    marginTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(1.5),
  },
}));

const MultiSelectCheckbox = ({
  form,
  name,
  label,
  options,
  maxChoices = null,
  children,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  if (!maxChoices) maxChoices = options.length;

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        name={name}
        control={form.control}
        defaultValue={[]} // can leave as empty, RHF will take from form.defaultValues
        rules={{
          validate: value => value.length > 0 || "You must select at least one option"
        }}
        render={({ field }) => {
          const selectedValues = (field.value || []).map(String);

          return (
          <FormGroup>
            {Object.entries(options).map(([key, label]) => {
              const isChecked = selectedValues.includes(key);
              const disableUnchecked =
                maxChoices && !isChecked && selectedValues.length >= maxChoices;

              return (
                <FormControlLabel
                  key={key}
                  className={classes.checkboxLabel}
                  control={
                    <Checkbox
                      className={classes.checkboxRoot}
                      checked={isChecked}
                      onChange={e => {
                        const newValues = e.target.checked
                          ? [...selectedValues, key]
                          : selectedValues.filter(item => item !== key);
                        field.onChange(newValues);
                      }}
                      disabled={disableUnchecked}
                      color="primary"
                    />
                  }
                  label={label}
                />
              );
            })}
          </FormGroup>
        );
      }}
    />
      {children}
      {/* insane, but EC has zero! */}
      {maxChoices && maxChoices > 0 && (
        <FormHelperText className={classes.helperText}>
          {t("select_options", {
            opt: maxChoices,
            defaultValue: `You can select up to ${maxChoices} option${maxChoices > 1 ? "s" : ""}`,
          })}
        </FormHelperText>
      )}
      {form.formState.errors[name] && (
        <FormHelperText error>
          {form.formState.errors[name].message}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default MultiSelectCheckbox;
