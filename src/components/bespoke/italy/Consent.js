import React from "react";

import { Container, Grid } from "@mui/material";

import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";

import makeStyles from '@mui/styles/makeStyles';
import { useCampaignConfig } from "@hooks/useConfig";

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
  const config = useCampaignConfig();

  const {
    formState: { errors },
    register,
    setValue,
  } = props.form;

  const handleCheck = (event) => {
    setValue(event.target.name, event.target.checked, { shouldValidate: true });
  };

  const handleClick = (event) => {
    event.preventDefault();
    window.open(event.target.href, "proca");
  };

  // TODO: replace the OCS dangerous privacy statement with a proper Trans ready syntax
  return (
    <Container component="main" maxWidth="sm">
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
                required
              />
              <span>{t("eci:form.certify-info")}</span>
            </FormLabel>
            <FormLabel
              className={classes.check}
              placement="end"
              error={!!(errors && errors.contentPrivacy)}
            >
              <Checkbox
                {...register("contentPrivacy")}
                onChange={handleCheck}
                color="primary"
                required
              />
              <span
                onClick={handleClick}
                dangerouslySetInnerHTML={{
                  __html: t("eci:form.privacy-statement", {
                    url: config.component.consent.privacyPolicy,
                    urlRegister: config.component.consent.content,
                  }),
                }}
              />
            </FormLabel>
          </FormGroup>
        </Grid>
      </Grid>
    </Container>
  );
}
