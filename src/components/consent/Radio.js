import ConfirmProcessing from "@components/consent/ConfirmProcessing";
import { useCampaignConfig } from "@hooks/useConfig";
import {
  Button,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import ConsentProcessing from "@components/consent/Processing";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  label: {
    "& span": {
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0),
      lineHeight: "1.1em!important",
    },
  },
}));

const RadioConsent = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(false);
  const config = useCampaignConfig();
  const {
    formState: { errors },
    register,
  } = props.form;
  const consentIntro =
    config.component?.consent?.intro === false || props.intro === false
      ? null
      : t("consent.intro", {
          name: config.organisation,
          campaign: config.campaign.title,
        });

  const optin = () => {
    setValue("opt-in");
    props.form.setValue("privacy", "opt-in");
  };

  const handleChange = event => {
    setValue(event.target.value);
  };

  const confirmOptOut = !(config.component.consent?.confirm === false); // by default we ask for confirmation

  return (
    <>
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors?.privacy}>
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
            {(!config.component?.consent?.split || coordinator) && (
              <FormControlLabel
                value="opt-in"
                checked={value === "opt-in"}
                className={classes.label}
                control={
                  <Radio
                    color="primary"
                    {...register("privacy", { required: true })}
                  />
                }
                label={t("consent.opt-in", { partner: config.organisation })}
              />
            )}
            {config.component?.consent?.split && !coordinator && (
              <>
                <FormControlLabel
                  value="opt-in"
                  className={classes.label}
                  checked={value === "opt-in"}
                  control={
                    <Radio
                      color="primary"
                      {...register("privacy", { required: true })}
                    />
                  }
                  label={t("consent.opt-in", { partner: config.organisation })}
                />
                <FormControlLabel
                  value="opt-in-both"
                  className={classes.label}
                  control={<Radio {...register("privacy")} color="primary" />}
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
              control={
                <Radio
                  {...register("privacy", {
                    required: t(["consent.required", "required field"]),
                  })}
                />
              }
              className={classes.label}
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
        <ConfirmProcessing form={props.form} />
      </Grid>
      <ConsentProcessing i18nKey="consent.preprocessing" large left />
    </>
  );
};

export default RadioConsent;
