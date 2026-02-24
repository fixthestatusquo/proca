import React, { useState } from "react";
import Checkbox from "@components/field/Checkbox";
import Hidden from "@components/field/Hidden";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import Dialog from "@components/Dialog";

const Confirm = props => {
  const validate = (value, formValues) => {
    console.log(value, formValues);
    return "not a validated";
  };
  return (
    <>
      <Hidden
        name="confirmed"
        value={false}
        form={props.form}
        validate={validate}
      />
      <Dialog
        name="confirm"
        maxWidth="lg"
        dialog={props.open}
        close={props.handleClose}
      >
        Hello
      </Dialog>
    </>
  );
};

const CheckboxConsent = props => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const props2 = {
    ...props,
    ...{
      name: "privacy",
      label: t("consent.opt-in", { partner: config.organisation }),
    },
  };

  return (
    <>
      <Confirm form={props.form} />
      <Checkbox {...props2} />
    </>
  );
  // return Checkbox(props2);
};

export default CheckboxConsent;
