import React from "react";
import { isDate } from "@lib/date";
import { Container, Grid, Typography } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "@components/field/TextField";
import { useTranslation } from "./hooks/useEciTranslation";

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const compact = props.compact;
  const form = props.form;

  const handleBlur = e => {
    if (isDate(e.target.value))
      form.clearErrors(e.target.attributes.name.nodeValue);
    else
      form.setError(e.target.attributes.name.nodeValue, {
        type: "format",
        message: t("eci:form.error.oct_error_invaliddateformat"),
      });
  };

  return (
    <Container component="div" maxWidth="sm">
      <Typography variant="subtitle1" component="legend">
        {t("eci:form.group-personal")}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={compact ? 12 : 6}>
          <TextField
            form={form}
            name="firstname"
            label={t("eci:form.property.full_first_names")}
            autoComplete="given-name"
            customValidity={props.customValidity}
            required
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 6}>
          <TextField
            form={form}
            name="lastname"
            label={t("eci:form.property.family_names")}
            autoComplete="family-name"
            customValidity={props.customValidity}
            required
          />
        </Grid>
        {props.birthdate && (
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
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
