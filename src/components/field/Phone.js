import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { checkPhone } from "@lib/checkPhone";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";
import { InputAdornment } from "@material-ui/core";
import CountryFlag from "react-emoji-flag";

const Phone = ({ form, classField }) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  if (!config.component.register?.field?.phone) return null;

  const validatePhone = async (phone) => {
    const result = await checkPhone(form.getValues("country"), phone);
    if (result.is_error === false && result.number) {
      console.log(result);
      form.setValue("phone", result.number); // Update the form value
      result.country && form.setValue("phoneCountry", result.country);
      return true;
    } else {
      return t("phone." + result.error, result.error);
    }
  };

  const phoneCountry = form.watch("phoneCountry");
  return (
    <Grid item xs={12} className={classField}>
      <input type="hidden" {...form.register("phoneCountry")} />
      <TextField
        type="tel"
        form={form}
        name="phone"
        label={t("Phone")}
        autoComplete="tel"
        validate={validatePhone}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {phoneCountry ? <CountryFlag countryCode={phoneCountry} /> : "📞"}
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
};

export default Phone;
