import React, { Fragment } from "react";
import {
  Box,
  Grid,
  Radio,
  Button,
  RadioGroup,
  FormHelperText,
  FormLabel,
  FormControl,
  FormControlLabel,
  Collapse,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

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
      textDecoration : "underline!important"
    },
  },
}));

const Consent = (props) => {
  const { errors, register } = props.form;
  const { t } = useTranslation();
  const [value, setValue] = React.useState(false);
  const config = useCampaignConfig();
  const classes = useStyles();
  const consentIntro =
    config.component?.consent?.intro === false
      ? null
      : t("consent.intro", {
          name: config.organisation,
          campaign: config.campaign.title,
        });

  const optin = (event) => {
    setValue("opt-in");
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const confirmOptOut = !(config.component.consent?.confirm === false); // by default we ask for confirmation

  return (
    <Fragment>
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!(errors && errors.privacy)}>
          {consentIntro && (
            <FormLabel
              component="legend"
              error={typeof errors.privacy === "object"}
            >
              {consentIntro} *
            </FormLabel>
          )}
          <RadioGroup
            aria-label="privacy consent"
            name="privacy"
            onChange={handleChange}
            required
          >
            {!config.component?.consent?.split && (
              <FormControlLabel
                value="opt-in"
                checked={value === "opt-in"}
                inputRef={register}
                className={classes.label}
                control={<Radio color="primary" required />}
                label={t("consent.opt-in", { partner: config.organisation })}
              />
            )}
            {config.component?.consent?.split && (
              <>
                <FormControlLabel
                  value="opt-in"
                  inputRef={register}
                  className={classes.label}
                  checked={value === "opt-in"}
                  control={<Radio color="primary" required />}
                  label={t("consent.opt-in", { partner: config.organisation })}
                />
                <FormControlLabel
                  value="opt-in-both"
                  inputRef={register}
                  className={classes.label}
                  control={<Radio color="primary" />}
                  label={t("consent.opt-in-both", {
                    lead: config.lead.title,
                    partner: config.organisation,
                  })}
                />
              </>
            )}

            <FormControlLabel
              value="opt-out"
              checked={value === "opt-out"}
              control={<Radio />}
              className={classes.label}
              inputRef={register({ required: t("Mandatory field") })}
              label={t("consent.opt-out")}
            />
            {confirmOptOut && (
              <Collapse in={value === "opt-out"}>
                <Alert severity="warning">
                  <Trans i18nKey="consent.confirm">
                    <AlertTitle>Sure?</AlertTitle>
                    <span>explanation</span>
                    <b>unsubscribe at any time</b>
                  </Trans>
                  <Button variant="contained" onClick={optin}>
                    {t("consent.opt-in", { partner: config.organisation })}
                  </Button>
                </Alert>
              </Collapse>
            )}
          </RadioGroup>
          <FormHelperText>{errors?.privacy?.message}</FormHelperText>
        </FormControl>
      </Grid>
    </Fragment>
  );
};

export const ConsentProcessing = (props) => {
  const config = useCampaignConfig();
  const classes = useStyles();
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
      <Box className={classes.notice}>
        <Trans i18nKey={/* i18next-extract-disable-line */ consentProcessing}>
          Consent processing according to <a href={link}>privacy policy</a>
        </Trans>
      </Box>
    </Grid>
  );
};

export default Consent;
