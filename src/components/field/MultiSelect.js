import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  makeStyles
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
    padding: theme.spacing(0.5,0.5,0.5,2.5),
    "& input": {
      height: 'auto!important',
    },
  },
  helperText: {
  marginTop: theme.spacing(0.5),
  paddingLeft: theme.spacing(1.5),
}
}));

const MultiSelectCheckbox = ({ form, name, label, options, maxChoices = null, children }) => {
  console.log("Rendering MultiSelectCheckbox", { name, label, options, maxChoices });
  const classes = useStyles();
  const { t } = useTranslation();
  const selectedValues = (form.watch(name) || []).map(String);

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
     <Controller
        name={name}
        control={form.control}
        defaultValue={[]} // can leave as empty, RHF will take from form.defaultValues
        render={({ field }) => (
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
        )}
      />
      {children}
      {maxChoices && (
        <FormHelperText className={classes.helperText}>
          {t("select_options", {
            count: maxChoices,
            defaultValue: `You can select up to ${maxChoices} option${maxChoices > 1 ? "s" : ""}`
          })}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default MultiSelectCheckbox;
