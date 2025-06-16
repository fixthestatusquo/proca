import React from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { InputAdornment } from "@material-ui/core";
import Salutation from "@components/field/Gender";
import { Grid } from "@material-ui/core";
import TextField from "@components/TextField";

const Name = ({ form, compact, classes, classField, enforceRequired }) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();

  const { t } = useTranslation();
  const withSalutation = config.component?.register?.field?.gender;
  const nameWidth = (field) => {
    if (compact) return 12;
    if (withSalutation && field === "firstname") return 5;
    if (withSalutation) return 5;
    return 6;
  };

  return (
    <>
      {withSalutation && (
        <Salutation form={form} compact={compact} classes={classes} />
      )}
      <Grid item xs={12} sm={nameWidth("firstname")} className={classField}>
        <TextField
          form={form}
          name="firstname"
          label={t("First name")}
          autoComplete="given-name"
          required
        />
      </Grid>
      {config.component.register?.field?.lastname !== false && (
        <Grid item xs={12} sm={nameWidth()} className={classField}>
          <TextField
            form={form}
            name="lastname"
            label={t("Last name")}
            autoComplete="family-name"
            required={
              enforceRequired &&
              config.component.register?.field?.lastname?.required
            }
          />
        </Grid>
      )}
    </>
  );
};

export default Name;
