import React from "react";
import TextField from "@components/field/TextField";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const Region = ({ form }) => {
  const config = useCampaignConfig();
  const locale = config.lang;
  const region = config.component?.register?.field?.region;
  if (!region || !region.locales) {
    console.error("missing config.component.register.field.region.locales");
    return null;
  }
  const { t } = useTranslation();
  let regions = Object.entries(t(region.locales, { returnObjects: true }));
  switch (region.sort) {
    case "value":
      regions = regions.sort(([, a], [, b]) => a.localeCompare(b, locale));
      break;
    case undefined:
    default:
      break;
  }
  return (
    <TextField
      select={open}
      name="region"
      required
      label={t("region")}
      form={form}
      SelectProps={{
        native: true,
      }}
    >
      <option key="empty" value="" />
      {regions.map(([k, v]) => {
        return (
          <option key={k} value={v}>
            {v}
          </option>
        );
      })}
    </TextField>
  );
};

export default Region;
