import React from "react";
import { isDate } from "../../lib/date";
import { Container, Grid, Typography } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "../TextField";
import { useTranslation } from "./hooks/useEciTranslation";

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const compact = props.compact;
  const form = props.form;

  const handleBlur = (e) => {
    if (isDate(e.target.value))
      form.clearErrors(e.target.attributes.name.nodeValue);
    else
      form.setError(e.target.attributes.name.nodeValue, {
        type: "format",
        message: t("eci:form.error.oct_error_invaliddateformat"),
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Typography variant="subtitle1" component="legend">
        {t("eci:form.group-personal")}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={compact ? 12 : 6}>
          <TextField
            form={form}
            name="firstname"
            label={t("eci:form.property.full_first_names")}
            placeholder="eg. Leonardo"
            autoComplete="given-name"
            required
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 6}>
          <TextField
            form={form}
            name="lastname"
            label={t("eci:form.property.family_names")}
            autoComplete="family-name"
            placeholder="eg. Da Vinci"
            required
          />
        </Grid>
        {props.birthdate && (
          <Grid item xs={12}>
            <TextField
              form={form}
              name="birthDate"
              onBlur={handleBlur}
              label={t("eci:form.property.date_of_birth")}
              placeholder="dd/mm/jjjj"
              required
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
