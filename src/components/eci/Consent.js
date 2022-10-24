import React from "react";

import { Container, Grid } from "@material-ui/core";

import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
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

  const { formState: { errors }, register, setValue } = props.form; // in react-hook-form 7, errors are stored in formState

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
              <Checkbox
                {...register("certify")}
                color="primary"
                onChange={handleCheck}
                name="certify"
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
