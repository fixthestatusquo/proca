import React from "react";
import TextField from "@components/field/TextField";
import { useComponentConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";

const Organisation = ({ form, classField, enforceRequired }) => {
  const component = useComponentConfig();
  const organisation = component.register.field.organisation;

  const { t } = useTranslation();
  return (
    <Grid item xs={12} className={classField}>
      <TextField name="url" type="url" required label={t("url")} form={form} />
      <TextField
        type="organisation"
        form={form}
        name="organisation"
        label={t("Organisation")}
        required={enforceRequired && organisation?.required}
      />
    </Grid>
  );
};

export default Organisation;
