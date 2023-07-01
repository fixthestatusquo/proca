import React from "react";
import { Container } from "@material-ui/core";
import TextField from "@components/TextField";

<Grid item xs={12}>
  <TextField
    InputLabelProps={{ shrink: true }}
    form={form}
    name="birthDate"
    onBlur={handleBlur}
    label={t("eci:form.property.date-of-birth")}
    placeholder={t("dateFormat")}
    customValidity={props.customValidity}
    required
  />
</Grid>;
