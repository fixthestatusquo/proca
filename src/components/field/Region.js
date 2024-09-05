import React from 'react';
import TextField from "@components/TextField";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from 'react-i18next';

const Region = ({ form }) => {
  const regions = useCampaignConfig().component?.register?.field?.region || null;
  if (!regions) return null;
  const { t } = useTranslation();
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
      <option key="empty" value=""></option>
          {Object.entries(regions).map(([k, v]) => {
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
