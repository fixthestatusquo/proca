import React from "react";
import { Box, Grid } from "@material-ui/core";
import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

import { makeStyles } from "@material-ui/core/styles";
import CheckboxConsent from "@components/consent/Checkbox";
import ButtonConsent from "@components/consent/Button";
import RadioConsent from "@components/consent/Radio";
import ImplicitConsent from "@components/consent/Implicit";

const useStyles = makeStyles(theme => ({
  label: {
    "& span": {
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0),
      lineHeight: "1.1em!important",
    },
  },
  consentProcessing: {
    color: theme.palette.text.primary,
    hyphens: "auto",
    lineHeight: "1.1em",
  },
  notice: {
    fontSize: theme.typography.pxToRem(13),
    fontWeight: "fontWeightLight",
    lineHeight: "1.1em",
    color: theme.palette.text.secondary,
    hyphens: "auto",
    "& a": {
      color: theme.palette.text.secondary,
      textDecoration: "underline!important",
    },
  },
}));

const Consent = props => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const classes = useStyles();

  if (config.component.consent?.implicit !== undefined)
    return <ImplicitConsent {...props} />;

  if (config.component.consent?.buttons) {
    return null;
  }

  if (config.component?.consent?.checkbox)
    return <CheckboxConsent {...props} />;

  if (config.component?.consent?.button) return <ButtonConsent {...props} />;

  return <RadioConsent {...props} classes={classes} />;
};

export const ConsentProcessing = props => {
  const config = useCampaignConfig();
  const classes = useStyles();
  if (
    !props.checkboxLabel &&
    config.component.consent?.confirmProcessing === true
  )
    return null;
  const link =
    config.component?.consent?.privacyPolicy ||
    config.org?.privacyPolicy ||
    "https://proca.app/privacy_policy";

  const consentProcessing =
    config.component?.country === false
      ? "consent.processing-nocookie"
      : "consent.processing";

  return (
    <Grid item xs={12}>
      <Box
        className={
          props.checkboxLabel ? classes.consentProcessing : classes.notice
        }
      >
        <Trans
          i18nKey={/* i18next-extract-disable-line */ consentProcessing}
          values={{ organisation: config.organisation }}
          components={{ url: <a />, 1: <a href={link} target="_blank" /> }}
        >
          Consent processing according to{" "}
          <a href={link} target="_blank">
            privacy policy
          </a>
        </Trans>
      </Box>
    </Grid>
  );
};

export default Consent;
