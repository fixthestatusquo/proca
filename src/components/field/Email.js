import React, { useRef } from "react";
import { checkMail, getDomain, prefetchDNS } from "@lib/checkMail";
import { useCampaignConfig } from "@hooks/useConfig";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { InputAdornment } from "@material-ui/core";
import EmailIcon from "@material-ui/icons/Email";
import GmailIcon from "../../images/Gmail";
import { useTheme } from "@material-ui/core/styles";
const EmailField = ({ form, required }) => {
  const theme = useTheme();
  const emailProvider = useRef(undefined); // we don't know the email provider
  const provider = form.watch("emailProvider");
  const config = useCampaignConfig();
  const { t } = useTranslation();

  const validateEmail = async email => {
    if (!email) return true; // don't validate the email domain if no email
    if (config.component?.register?.validateEmail === false) return true;
    //    if (emailProvider.current) return true; // might cause some missing validation on edge cases
    const provider = await checkMail(email);
    emailProvider.current = provider;
    if (provider === false) {
      form.setValue("emailProvider", "");
      return t("email.invalid_domain", {
        defaultValue: "{{domain}} cannot receive emails",
        domain: getDomain(email),
      });
    }
    form.setValue("emailProvider", provider);
    return true;
  };

  let iconColor = theme.palette.text.secondary;
  if (form.getFieldState("email").invalid) {
    iconColor = theme.palette.error.main;
  }
  if (provider) {
    iconColor = theme.palette.success.main;
  }
  return (
    <>
      <input type="hidden" {...form.register("emailProvider")} />
      <TextField
        form={form}
        name="email"
        validate={validateEmail}
        type="email"
        label={t("Email")}
        autoComplete="email"
        onFocus={prefetchDNS}
        required={!!required}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {provider === "google.com" ? (
                <GmailIcon size={28} />
              ) : (
                <EmailIcon style={{ color: iconColor }} />
              )}
            </InputAdornment>
          ),
        }}
      />
    </>
  );
};

export default EmailField;
