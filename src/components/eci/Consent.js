import React, { useState } from "react";

import { Container, Grid } from "@material-ui/core";

import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";

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
  }
}));

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const classes = useStyles();
  const { t } = useTranslation();

  const form = props.form;
  const [certify, setCertify] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const handleCertify = (event) => {
    setCertify(event.target.checked);
  };

  const handlePrivacy = (event) => {
    setPrivacy(event.target.checked);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormGroup className={classes.root}>
            <FormLabel className={classes.check} placement="end">
              <Checkbox
                color="primary"
                checked={certify}
                onChange={handleCertify}
                name="certify"
              />
              <span>{t("eci:form.certify-info")}</span>
            </FormLabel>
            <FormLabel className={classes.check} placement="end">
              <Checkbox
                color="primary"
                checked={privacy}
                onChange={handlePrivacy}
                name="privacy"
              />
              <span
                dangerouslySetInnerHTML={{
                  __html: t("eci:form.privacy-statement"),
                }}
              />
            </FormLabel>
          </FormGroup>
        </Grid>
      </Grid>
    </Container>
  );
}
