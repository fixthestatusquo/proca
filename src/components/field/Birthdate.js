import React from "react";
import { Grid } from "@material-ui/core";
import { isDate, parse } from "@lib/date";
import TextField from "@components/field/TextField";
import { useTranslation } from "react-i18next";

const Birthdate = props => {
  const { t } = useTranslation();

  const form = props.form;

  const validateDate = date => {
    console.log("validate date", date);
    if (date === "" && !props.required) return true;

    if (!isDate(date)) return t("date.error");
    if (props.min) {
      const d = parse(date);
      const min = props.min.getTime();
      return d < min ? true : t("you need to be 18 years old");
    }
    return true;
  };

  return (
    <Grid item xs={12}>
      <TextField
        InputLabelProps={{ shrink: true }}
        form={form}
        name="birthdate"
        validate={validateDate}
        label={t("Birthdate")}
        placeholder={t("dateFormat")}
        required={props.required}
      />
    </Grid>
  );
};

export default Birthdate;
