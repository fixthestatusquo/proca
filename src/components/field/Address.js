import React, { useEffect } from "react";

import { Grid } from "@material-ui/core";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import Country from "@components/Country";
import HiddenField from "@components/field/Hidden";

const Address = (props) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();

  const { t } = useTranslation();

  const compact = props.compact;
  const { setValue, watch, classField, getValues } = props.form;

  const [postcode, country] = watch(["postcode", "country"]);
  const postcodeLength = {
    BE: 4,
    CH: 4,
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
    if (!postcode || postcode.length !== postcodeLength[country]) {
      const [area, constituency, locality] = getValues([
        "area",
        "constituency",
        "locality",
      ]);
      if (area) setValue("area", "");
      if (locality) setValue("locality", "");
      if (constituency) setValue("constituency", "");
      return;
    }
    const api = "https://" + country + ".proca.app/" + postcode;

    async function fetchAPI() {
      await fetch(api)
        .then((res) => {
          if (!res.ok) {
            setValue("locality", "");
            setValue("area", "");
            setValue("constituency", "");

            throw Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res && res.name) {
            setValue("locality", res.name);
            setValue("constituency", "");
            setValue("area", "");
          }
          if (res && res.area) {
            setValue("area", res.area);
            setValue("constituency", "");
          }
          if (res && res.constituency) {
            setValue("constituency", res.constituency);
          }
        })
        .catch((err) => {
          // for now, let's not flag as an error if we don't find the postcode
          /* setError("postcode", {
            type: "network",
            message: (err && err.toString()) || "Network error",
          }); */
        });
    }
    fetchAPI();
    // eslint-disable-next-line
  }, [postcode, country, setValue, getValues]);

  // xor postcode + locality?
  const hasPostcode = config.component.register?.field?.postcode !== false;
  const hasLocality = config.component.register?.field?.locality;

  const minWidthCountry = hasPostcode && !hasLocality ? 9 : 12;

  return (
    <>
      {config.component.register?.field?.street && (
        <Grid item xs={12} className={classField}>
          <TextField form={props.form} name="street" label={t("Street")} />
        </Grid>
      )}
      {hasPostcode && (
        <Grid item xs={12} sm={compact ? 12 : 3} className={classField}>
          <TextField
            form={props.form}
            name="postcode"
            autoComplete="postal-code"
            label={t("Postal Code")}
            customValidity={props.customValidity}
            required={config.component.register?.field?.postcode?.required}
          />
        </Grid>
      )}
      {hasLocality && (
        <Grid item xs={12} sm={compact ? 12 : 9} className={classField}>
          <TextField
            form={props.form}
            name="locality"
            label={t("City")}
            required={config.component.register?.field?.locality?.required}
            customValidity={props.customValidity}
          />
        </Grid>
      )}
      {config.component.register?.field?.country === false &&
        config.component.country && (
          <HiddenField
            form={props.form}
            name="country"
            value={config.component.country}
          />
        )}
      {config.component.register?.field?.country !== false && (
        <Grid
          item
          xs={12}
          sm={compact ? 12 : minWidthCountry}
          className={classField}
        >
          <Country form={props.form} required />
        </Grid>
      )}
    </>
  );
};

export default Address;
