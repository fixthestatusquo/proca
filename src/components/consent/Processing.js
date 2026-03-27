import React from "react";
import { Box, Grid } from "@material-ui/core";
import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  large: {
    hyphens: "auto",
    lineHeight: "1.1em",
    fontSize: theme.typography.body1.fontSize, // '1rem'
    color: theme.palette.text.primary,
    margin: theme.spacing(-1, 0, 1, 4),
    paddingTop: 0,
  },
  left: { marginLeft: theme.spacing(0) },
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

const ConsentProcessing = props => {
  const { i18n } = useTranslation();
  const config = useCampaignConfig();
  const classes = useStyles();

  if (props.i18nKey && !i18n.exists(props.i18nKey)) return null;

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

  let className =
    props.checkboxLabel || props.large ? classes.large : classes.notice;
  if (props.left) {
    className = `${classes.left} ${className}`;
  }
  return (
    <Grid item xs={12}>
      <Box className={className}>
        <Trans
          i18nKey={
            /* i18next-extract-disable-line */ props.i18nKey ||
            consentProcessing
          }
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

export default ConsentProcessing;
