import React, { useRef } from "react";
import { checkMail, getDomain } from "@lib/checkMail";
import { useCampaignConfig } from "@hooks/useConfig";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";

const EmailField = ({ form }) => {
  let emailProvider = useRef(undefined); // we don't know the email provider
  console.log(emailProvider.current);
  const config = useCampaignConfig();
  const { t } = useTranslation();

  const validateEmail = async (email) => {
    if (config.component?.register?.validateEmail === false) return true;
    if (emailProvider.current) return true; // might cause some missing validation on edge cases
    const provider = await checkMail(email);
    emailProvider.current = provider;
    console.log(provider);
    if (provider === false) {
      return t("email.invalid_domain", {
        defaultValue: "{{domain}} cannot receive emails",
        domain: getDomain(email),
      });
    }
    return true;
  };

  return (
    <TextField
      form={form}
      name="email"
      validate={validateEmail}
      type="email"
      label={t("Email")}
      autoComplete="email"
      required
    />
  );
};

export default EmailField;
