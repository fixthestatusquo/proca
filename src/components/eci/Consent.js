import React from "react";

import { Container, Grid } from "@mui/material";

import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";

import makeStyles from '@mui/styles/makeStyles';
import EciDialog from "./Popup";

const useStyles = makeStyles((theme) => ({
  /* Styles applied to the root element. */
  root: {
    marginTop: theme.spacing(1),
  },
  check: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    // For correct alignment with the text.
    verticalAlign: "middle",
    WebkitTapHighlightColor: "transparent",
    marginLeft: -11,
    marginRight: 16, // used for row presentation of radio/checkbox
    "& span": { fontSize: theme.typography.pxToRem(13) },
  },
}));

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const classes = useStyles();
  const { t } = useTranslation();

  const {
    formState: { errors },
    register,
    setValue,
  } = props.form;

  const handleCheck = (event) => {
    setValue(event.target.name, event.target.checked, { shouldValidate: true });
  };

  // TODO: replace the OCS dangerous privacy statement with a proper Trans ready syntax
  return (
    <Container component="div" maxWidth="sm">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormGroup className={classes.root}>
            <FormLabel
              className={classes.check}
              placement="end"
              error={!!(errors && errors.certify)}
            >
              {/* TO DO: CHECK IF IT IS REALY REQUIRED */}
              <Checkbox
                {...register("certify")}
                color="primary"
                onChange={handleCheck}
                required
              />
              <span>{t("eci:form.certify-info")}</span>
            </FormLabel>
            <FormLabel
              className={classes.check}
              placement="end"
              error={!!(errors && errors.privacy)}
            >
              <Checkbox
                {...register("contentPrivacy")}
                onChange={handleCheck}
                color="primary"
                required
              />
              <EciDialog />
            </FormLabel>
          </FormGroup>
        </Grid>
      </Grid>
    </Container>
  );
}
