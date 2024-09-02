import React, { useEffect } from "react";

import { Typography, Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "@components/TextField";
import documentType from "@data/document_types_name.json";
import { useTranslation } from "react-i18next";
export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t, i18n } = useTranslation();

  const country = props.country;
  const id = Object.keys(props.ids).length; // number of different ids accepted
  const { setValue } = props.form;

  useEffect(() => {
    if (id < 2) return null;
    setValue("documentType", Object.keys(props.ids)[0]);
    // eslint-disable-next-line
  }, [id, country]);

  const label = () => {
    if (id > 1) return null;
    const type =
      documentType[`${country.toLowerCase()}.${Object.keys(props.ids)[0]}`];
    if (typeof type === "string" || !type) return type;
    // belgium case with the id type has different names based on the language)
    return type[i18n.language] ? type[i18n.language] : type["fr"]; //fr is the first language on their list
  };
  return (
    <Container component="div" maxWidth="sm">
      <Typography variant="subtitle1" component="legend">
        {t("eci:form.group-document")}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {id > 1 && (
            <TextField
              select
              name="documentType"
              label={t("eci:form.document-type")}
              form={props.form}
              SelectProps={{
                native: true,
              }}
            >
              {Object.entries(props.ids).map((id) => (
                <option key={id[0]} value={id[0]}>
                  {documentType[`${country.toLowerCase()}.${id[0]}`]}
                </option>
              ))}
            </TextField>
          )}

          <TextField
            form={props.form}
            name="documentNumber"
            label={label() || t("eci:form.document-number")}
            customValidity={props.customValidity}
            required
          />
        </Grid>
      </Grid>
    </Container>
  );
}
