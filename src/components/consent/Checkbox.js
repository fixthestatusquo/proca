import React, { useState } from "react";
import Checkbox from "@components/field/Checkbox";
import Hidden from "@components/field/Hidden";
import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import Dialog from "@components/Dialog";
import { Button, Grid, Box } from "@material-ui/core";

const Confirm = props => {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState();
  const config = useCampaignConfig();
  const link =
    config.component?.consent?.privacyPolicy ||
    config.org?.privacyPolicy ||
    "https://proca.app/privacy_policy";

  const triggerSubmit = () => {
    console.log(
      props.form.control._fields?.privacy,
      props.form.control._fields?.privacy?._f?.ref?.current,
      props.form.control._fields?.privacy?._f?.ref?.current?.closest("form")
    );
    props.form.control._fields?.privacy?._f?.ref?.current
      ?.closest("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    close();
  };

  const close = () => {
    setConfirmed(true);
  };

  const validate = (_value, formValues) => {
    if (confirmed || formValues.privacy) {
      return;
    }
    setConfirmed(false);
    return "do you want to opt-out?";
  };
  const setOptIn = () => {
    props.form.setValue("privacy", "opt-in");
    triggerSubmit();
  };

  return (
    <>
      <Hidden
        name="confirmed"
        value={confirmed}
        form={props.form}
        validate={validate}
      />
      <Dialog
        name={t(["consent.checkbox.confirm.title", "dialogTitle"], "")}
        dialog={confirmed === false}
        close={close}
      >
        {t(["consent.checkbox.confirm.intro", "consent.intro"], {
          campaign: config.campaign.title,
        })}
        <Box my={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={setOptIn}
              >
                {t(["consent.checkbox.confirm.opt-in", "yes"])}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="contained" fullWidth onClick={triggerSubmit}>
                {t(["consent.checkbox.confirm.opt-out", "no"])}
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Trans
          i18nKey={
            /* i18next-extract-disable-line */ [
              "consent.checkbox.processing",
              "consent.processing",
            ]
          }
          values={{ organisation: config.organisation }}
          components={{ url: <a />, 1: <a href={link} target="_blank" /> }}
        >
          Consent processing according to{" "}
          <a href={link} target="_blank">
            privacy policy
          </a>
        </Trans>
      </Dialog>
    </>
  );
};

const CheckboxConsent = props => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const confirm = !(config.component.consent?.confirm === false); // by default we ask for confirmation
  const props2 = {
    ...props,
    ...{
      name: "privacy",
      label: t(["consent.checkbox.label", "consent.opt-in"], {
        partner: config.organisation,
      }),
    },
  };

  return (
    <>
      {confirm && <Confirm form={props.form} />}
      <Checkbox {...props2} />
    </>
  );
  // return Checkbox(props2);
};

export default CheckboxConsent;
