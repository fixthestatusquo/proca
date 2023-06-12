import React from "react";
import { Grid, FormHelperText } from "@mui/material";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useLayout } from "@hooks/useLayout";
import { ConfirmProcessing } from "@components/Consent";

import makeStyles from '@mui/styles/makeStyles';

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

  return (
    <>
      <Grid item xs={12}>
        <ConfirmProcessing form={props.form} />
      </Grid>
      {config.component.consent.implicit === "opt-in" && (
        <>
          <Grid item xs={12}>
            <FormHelperText
              className={classes.bigHelper}
              margin={layout.margin}
            >
              {t("consent.implicit", {
                name: config.organisation,
                campaign: config.campaign.title,
              })}
            </FormHelperText>
          </Grid>
        </>
      )}
    </>
  );
};

export default ImplicitConsent;
