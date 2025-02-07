import React from "react";
import Checkbox from "@components/field/Checkbox";
import { Grid } from "@material-ui/core";
import Orcid from "@components/field/Orcid";
import Select from "@components/field/Select";
import Affiliation from "@components/field/ResearchOrganisation";
import { Alert, AlertTitle } from "@material-ui/lab";
import TextField from "@components/TextField";
import Country from "@components/field/Country";
import { useTranslation } from "react-i18next";

const EggManifesto = ({ form }) => {
  const [organisation, organisation_sign] = form.watch([
    "organisation",
    "organisation_sign",
  ]);

  let label =
    "Sign on the behalf of " +
    (organisation || "your organisation or a research group/department");

  const { t } = useTranslation();

  return (
    <>
      <Grid item xs={12}>
        <Orcid form={form} />
        <Affiliation form={form} />
        {organisation_sign &&
          <TextField
            name='lab'
            label={t("lab", "Lab or research group")}
            form={form}
          />
        }
          <Checkbox
            name="organisation_sign"
            disabled={!organisation}
            form={form}
            label={label}
          />
      </Grid>
      {organisation_sign && (
        <Grid item>
          <Alert severity="info" style={{ marginTop: 8 }}>
            <AlertTitle>Your details will not be displayed yet.</AlertTitle>
            We need to approve your institution's signature
          </Alert>
        </Grid>
      )}
      <Grid item sm={4}>
        <Select
          name="gender"
          label="Gender"
          options="campaign:profile.gender"
          form={form}
        />
      </Grid>
      <Grid item sm={8}>
        <Select
          name="stage"
          label="Career stage"
          options="campaign:profile.stage"
          form={form}
        />
      </Grid>
      <Grid item sm={8}>
        <Country
          form={form}
          required={false}
          name="origin"
          label="Country of origin"
        />
      </Grid>
      <Grid item sm={4}>
        <TextField type="number" form={form} name="age" label="Age" />
      </Grid>
    </>
  );
};

export default EggManifesto;
