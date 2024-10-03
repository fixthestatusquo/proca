import React, { useEffect } from "react";

import { Typography, Container, Grid } from "@material-ui/core";
import TextField from "@components/TextField";
import Country from "@components/field/Country"; // the country component is for address, different than the country for nationality
import { useTranslation } from "react-i18next";

export default function Register(props) {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const compact = props.compact;
  const form = props.form;

  const { setValue, watch } = props.form;

  const [postcode, country] = watch(["postcode", "country"]);

  const postcodeLength = {
    DE: 5,
    FR: 5,
    IT: 5,
    PL: 5,
    CA: 5,
    DK: 4,
    NL: 4,
  };

  const geocountries = props.geocountries || Object.keys(postcodeLength);

  useEffect(() => {
    if (!geocountries.includes(country)) {
      return;
    }
    if (!postcode || postcode.length !== postcodeLength[country]) return;
    const api = `https://${country}.proca.app/${postcode}`;

    async function fetchAPI() {
      await fetch(api)
        .then((res) => {
          if (!res.ok) {
            throw Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res && res.name) {
            setValue("city", res.name);
          }
        })
        .catch(() => {
          // for now, let's not flag as an error if we don't find the postcode
          /* setError("postcode", {
            type: "network",
            message: (err && err.toString()) || "Network error",
          }); */
        });
    }
    fetchAPI();
     
  }, [postcode, country, setValue]);

  return (
    <Container component="div" maxWidth="sm">
      <Typography variant="subtitle1" component="legend">
        {t("eci:form.group-address")}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            form={form}
            name="address"
            label={
              `${t("eci:form.property.street_number")} & ${t("eci:form.property.street")}`
            }
            required
            customValidity={props.customValidity}
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 3}>
          <TextField
            form={form}
            autoComplete="postal-code"
            name="postcode"
            label={t("eci:form.property.postal_code")}
            required
            customValidity={props.customValidity}
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 9}>
          <TextField
            form={form}
            name="city"
            label={t("eci:form.property.city")}
            required
            customValidity={props.customValidity}
          />
        </Grid>
        <Country
          form={form}
          name="country"
          countries={props.countries}
          country={props.country}
          other={true}
        />
      </Grid>
    </Container>
  );
}
