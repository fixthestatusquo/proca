import React, { Fragment } from "react";
import {
  Box,
  Grid,
  Radio,
  Button,
  RadioGroup,
  FormHelperText,
  FormLabel,
  FormGroup,
  FormControl,
  FormControlLabel,
  Collapse,
  Checkbox,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { Controller } from "react-hook-form";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
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

const Consent = (props) => {
  const { formState: { errors }, register } = props.form; // in react-hook-form 7, errors are stored in formState

  const { t } = useTranslation();
  const [value, setValue] = React.useState(false);
  const config = useCampaignConfig();
  const classes = useStyles();
  const consentIntro =
    config.component?.consent?.intro === false || props.intro === false
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

                className={classes.label}
                control={<Radio color="primary" {...register("privacy")} required />}
                label={t("consent.opt-in", { partner: config.organisation })}
              />
            )}
            {config.component?.consent?.split && (
              <>
                <FormControlLabel
                  value="opt-in"
                  className={classes.label}
                  checked={value === "opt-in"}
                  control={<Radio color="primary"  {...register("privacy") } required />}
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
              control={<Radio {...register("privacy")}  required/>}
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
    </Fragment>
  );
};

export const ConfirmProcessing = (props) => {
  const { formState: { errors }, control } = props.form; // errors are in formState in React Hook Form 7
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const classes = useStyles();
  if (!config.component.consent?.confirmProcessing) return null;
  return (
    <FormControl error={!!(errors && errors.consentProcessing)}>
      <FormGroup>
        <FormControlLabel
          className={classes.check}
          placement="end"


          control={
            <Controller
              name="consentProcessing"
              control={control}
              defaultValue={false}
              rules={{ required: t(["consent.required", "required"]) }}
              render={({ field, fieldState }) => (
                <Checkbox
                  {...field}
                  color="primary"
                  onChange={(e) => field.onChange(e.target.checked)}
                  checked={field.value}
                />
              )}
            />
          }
          label={<ConsentProcessing checkboxLabel={true} />}
        />
        <FormHelperText>{errors.consentProcessing?.message}</FormHelperText>
      </FormGroup>
    </FormControl>
  );
};

export const ConsentProcessing = (props) => {
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
        >
          Consent processing according to <a href={link}>privacy policy</a>
        </Trans>
      </Box>
    </Grid>
  );
};

export default Consent;
