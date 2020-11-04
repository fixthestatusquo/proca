import React from "react";

import { Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "../TextField";
import Country from "../Country";
import { useTranslation } from "react-i18next";

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const compact = props.compact;
  const form = props.form;

  return (
      <Container component="main" maxWidth="sm">
        <h4>{t("eci:form.group-address")}</h4>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              form={form}
              name="lastname"
              label={t("eci:form.property.street")}
              placeholder="eg. Da Vinci"
              required
            />
          </Grid>
          <Grid item xs={12} sm= {compact ? 4 : 8}>
            <TextField
              form={form}
              name="postcode"
              label={t("eci:form.property.postal_code")}
              required
            />
          </Grid>
          <Grid item xs={12} sm= {compact ? 8 : 4}>
            <TextField
              form={form}
              name="city"
              label={t("eci:form.property.city")}
              required
            />
          </Grid>
           <Country form={form} />
         
        </Grid>
      </Container>
  );
}

