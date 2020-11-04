import React from "react";

import { Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "../TextField";
import { useTranslation } from "react-i18next";
export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const compact = props.compact;
  const form = props.form;
  const {
    register,
    setValue,
    watch,
  } = props.form;

  const country = watch("nationality") || "";
  console.log(Object.entries(props.ids)[0]);

  return (
      <Container component="main" maxWidth="sm">
        <h4>{t("eci:form.group-document")}</h4>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={compact ? 12 : 6}>
         {(Object.entries(props.ids).length >1) && <TextField
              select
              name="document_type"
              label={t("eci:form.document-type")}
              form={props.form}
              SelectProps={{
                native: true,
              }}
  >
              {Object.entries(props.ids).map(id => (
                <option key={id[0]} value={id[0]}>
                {id[0]}
                </option>
              ))}
            </TextField>}

            <TextField
              form={form}
              name="number"
              label={Object.entries(props.ids).length === 1 ? Object.entries(props.ids)[0][0] : t("eci:form.document-number")}
              required
            />
          </Grid>
        </Grid>
      </Container>
  );
}

