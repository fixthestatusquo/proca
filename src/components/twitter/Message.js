import React from "react";
//import TextField from '@mui/material/TextField';
import TextField from "@components/TextField";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

export default function TwitterMessage(props) {
  const { t } = useTranslation();
  return (
    <Grid container spacing={1} alignItems="stretch">
      <Grid item xs={12}>
        <TextField
          name="message"
          multiline
          form={props.form}
          label={props.label || t("Your message")}
        />
      </Grid>
    </Grid>
  );
}
