import React from "react";

import { Typography, Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "../TextField";
import documentType from "../../data//document_types_name.json";

import { useTranslation } from "react-i18next";
export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const form = props.form;
  const {
    watch,
  } = props.form;

  const country = watch("nationality") || "";


  return (
      <Container component="main" maxWidth="sm">
        <Typography variant="subtitle1" component="legend">{t("eci:form.group-document")}</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
         {(Object.entries(props.ids).length >1) && <TextField
              select
              name="documentType"
              label={t("eci:form.document-type")}
              form={props.form}
              SelectProps={{
                native: true,
              }}
  >
              {Object.entries(props.ids).map(id => (
                <option key={id[0]} value={id[0]}>
                {documentType[country.toLowerCase()+"." +id[0]]}
                </option>
              ))}
            </TextField>}

            <TextField
              form={form}
              name="documentNumber"
              label={Object.entries(props.ids).length === 1 ? documentType[country.toLowerCase()+"."+Object.entries(props.ids)[0][0]] : t("eci:form.document-number")}
              required
            />
          </Grid>
        </Grid>
      </Container>
  );
}

