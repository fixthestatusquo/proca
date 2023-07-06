import React from "react";
import { Grid } from "@material-ui/core";
import { isDate } from "@lib/date";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";

const Birthdate = (props) => {
  const { t } = useTranslation();

  const form = props.form;

  const handleBlur = (e) => {
    if (isDate(e.target.value))
      form.clearErrors(e.target.attributes.name.nodeValue);
    else
      form.setError(e.target.attributes.name.nodeValue, {
        type: "format",
        message: t("date.invalid", "invalid date format, dd-mm-yyyy"),
      });
  };

  return (
    <Grid item xs={12}>
      <TextField
        InputLabelProps={{ shrink: true }}
        form={form}
        name="birthDate"
        onBlur={handleBlur}
        label={t("date.birthdate")}
        placeholder={t("date.placeholder")}
        required
      />
    </Grid>
  );
};

export default Birthdate;
