import React, {useRef} from "react";
import { isDate } from "@lib/date";
import { Container, Grid, Typography, TextField as TField } from "@material-ui/core";
import InputMask from 'react-input-mask';
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import TextField from "@components/TextField";
import { useTranslation } from "./hooks/useEciTranslation";
import { useLayout } from "@hooks/useLayout";

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const refBirthdate = useRef(null);
  const { t } = useTranslation();
  const layout = useLayout();
  const compact = props.compact;
  const form = props.form;

  //const { setValue, getValues } = form;

  const handleBlur = (e) => {
    if (isDate(e.target.value)) {
      form.clearErrors(e.target.attributes.name.nodeValue);
      form.setValue(e.target.name, e.target.value);
      console.log('0000000000000000', form.getValues());
    }
    else {
      form.setError(e.target.attributes.name.nodeValue, {
        type: "format",
        message: t("eci:form.error.oct_error_invaliddateformat"),
      });
    }
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
            required
          />
        </Grid>
        {/* {props.birthdate && ( */}
        <Grid item xs={12}>
            <InputMask
            mask="99/99/9999"
            placeholder='DD/MM/YYYY'
            form={form}
            onBlur={handleBlur}
            >
              {(inputProps) => (
              <TField
                {...inputProps}
              ref={refBirthdate}
              InputLabelProps={{ shrink: true }}
              variant={layout.variant}
              margin={layout.margin}
              label={t("eci:form.property.date-of-birth")}
              name="birthDate"
                {...form.register("birthDate", {required: true})}

                />)}
            </InputMask>
          </Grid>
        {/* )} */}
      </Grid>
    </Container>
  );
}
