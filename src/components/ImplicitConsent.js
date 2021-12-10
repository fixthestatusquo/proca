import React from "react";
import { Box, Grid, FormHelperText } from "@material-ui/core";

import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useLayout } from "@hooks/useLayout";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  bigHelper: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
    fontSize: theme.typography.pxToRem(16),
    width: "100%",
    color: theme.palette.text.primary,
    padding: "4px",
    lineHeight: "1.3em",
  },
  label: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0),
  },
  notice: {
    fontSize: theme.typography.pxToRem(13),
    fontWeight: "fontWeightLight",
    lineHeight: "1.3em",
    color: theme.palette.text.secondary,
    "& a": {
      color: theme.palette.text.secondary,
    },
  },
}));

const ImplicitConsent = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const layout = useLayout();
  const classes = useStyles();

  const link =
    config.component.consent.privacyPolicy ||
    "https://proca.app/privacy_policy";
  const consentProcessing =
    config.component.country === false
      ? "consent.processing-nocookie"
      : "consent.processing";
  return (<>
    {config.component.consent.implicit !=="opt-out" && (
      <><Grid item xs={12}>
        <FormHelperText className={classes.bigHelper} margin={layout.margin}>
          {t("consent.implicit", {
            name: config.organisation,
            campaign: config.campaign.title,
          })}
        </FormHelperText>
      </Grid>
      <Grid item xs={12}>
        <Box className={classes.notice}>
          <Trans i18nKey={/* i18next-extract-disable-line */ consentProcessing}>
            Consent processing according to <a href={link}>privacy policy</a>
          </Trans>
        </Box>
      </Grid>
      </>
    )}</>);
};

export default ImplicitConsent;
