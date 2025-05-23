import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { checkPhone, prefetchDNS } from "@lib/checkPhone";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";
import { InputAdornment } from "@material-ui/core";
import CountryFlag from "react-emoji-flag";
import PhoneIcon from "@material-ui/icons/Phone";
const Phone = ({ form, classField, compact }) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  if (!config.component.register?.field?.phone) return null;

  const hasPostcode = config.component.register?.field?.postcode !== false;
  const hasLocality = config.component.register?.field?.locality;
  const hasCountry = config.component.register?.field?.country !== false;
  const narrowPhone = !compact && hasPostcode && !hasLocality && !hasCountry;

  const validatePhone = async phone => {
    const result = await checkPhone(form.getValues("country"), phone);
    if (result.is_error === false) {
      form.setValue("phone", result.number || ""); // Update the form value
      form.setValue("phoneCountry", result.country);
      return true;
    } else {
      form.setValue("phoneCountry", undefined);
      return result.error ? t(`phone.${result.error}`, result.error) : true;
    }
  };

  const phoneCountry = form.watch("phoneCountry");

  if (form.getFieldState("phone").invalid) {
    //  iconColor = theme.palette.error.main;
  }
  return (
    <Grid item xs={12} sm={narrowPhone? 9 : 12} className={classField}>
      <input type="hidden" {...form.register("phoneCountry")} />
      <TextField
        type="tel"
        form={form}
        name="phone"
        label={t("Phone")}
        autoComplete="tel"
        validate={validatePhone}
        onFocus={prefetchDNS}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {phoneCountry ? (
                <CountryFlag countryCode={phoneCountry} />
              ) : (
                <PhoneIcon
                  color={
                    form.getFieldState("phone").invalid ? "error" : "action"
                  }
                />
              )}
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
};

export default Phone;
