import React,  {useState} from "react";

import { Container, Grid } from "@material-ui/core";

import TextField from "../TextField";

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import { useTranslation } from "react-i18next";
export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const compact = props.compact;
  const form = props.form;
  const [certify,setCertify]= useState (false);
  const handleChange = e =>{
    console.log(e);
    setCertify(true);
  }
  return (
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
              <FormControlLabel
            control={<Checkbox color="primary" checked={certify} onChange={handleChange} name="certify" />}
            label={t("eci:form.certify-info")}
          />
          </Grid>
        </Grid>
      </Container>
  );
}

