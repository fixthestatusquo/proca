import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { checkPhone } from "@lib/checkPhone";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";

const Phone = ({ form, classField }) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  if (!config.component.register?.field?.phone) return null;

  const validatePhone = async (phone) => {
    const result = await checkPhone(form.getValues("country"), phone);
    if (result.is_error === false && result.number) {
      form.setValue("phone", result.number); // Update the form value
      return true;
    } else {
      return t("phone." + result.error, result.error);
    }
  };

  return (
    <Grid item xs={12} className={classField}>
      <TextField
        type="tel"
        form={form}
        name="phone"
        label={t("Phone")}
        validate={validatePhone}
      />
    </Grid>
  );
};

export default Phone;
