import React, { useEffect } from "react";
import useData from "@hooks/useData";

import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import useGeoLocation from "react-ipgeolocation";
import { useCampaignConfig } from "@hooks/useConfig";
import { useIsWindows } from "@hooks/useDevice";
import { Container, Grid } from "@material-ui/core";

const emoji = country => {
  const offset = 127397;
  let emoji = "";

  if (!country || country.toUpperCase() === "ZZ") return "";

  country
    .toUpperCase()
    .split("")
    .forEach(
      char => (emoji += String.fromCodePoint(char.charCodeAt(0) + offset))
    );

  return emoji;
};

const Flag = props => {
  const country = props.country?.toUpperCase();
  const name = props.countries.find(d => d.iso === country);
  if (!name) return null;
  const d = emoji(country);
  return <span title={name.name}>{d}</span>;
};

const Country = props => {
  const isWindows = useIsWindows();
  const config = useCampaignConfig();
  const [, setData] = useData();

  const { t } = useTranslation();

  const countries = Object.keys(props.countries).map(iso => ({
    iso: iso.toUpperCase(),
    name: props.countries[iso],
  }));

  const compare = new Intl.Collator(config.lang.toLowerCase().substring(0, 2))
    .compare;
  countries.sort((a, b) => compare(a.name, b.name));

  //  if (props.other) {
  //    countries = useMemo(() => addMissingCountries(countries), [countries]);
  //  }

  const { register, setValue, watch } = props.form;

  const country = watch("nationality") || "";
  const location = useGeoLocation({
    api: "https://country.proca.foundation",
    country: config.data.country || config.component.country,
  });
  useEffect(() => {
    if (location.country && !country) {
      if (!countries.find(d => d.iso === location.country)) {
        console.log("visitor from ", location.country, "but not in EU");
        location.country = countries.find(d => d.iso === "ZZ") ? "ZZ" : ""; // if "other" exists, set it
      }
      if (!location.country) return;

      setValue("nationality", location.country);
      setData("nationality", country);
    }
  }, [location, country, countries, setValue, setData]);

  useEffect(() => {
    register("nationality");
  }, [register]);

  if (props.list === false) return null;

  return (
    <Container component="div" maxWidth="sm">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            select
            name="nationality"
            label={t("eci:form.support_country_selected")}
            form={props.form}
            required
            SelectProps={{
              native: true,
            }}
          >
            <option key="" value="" />
            {countries.map(option => (
              <option key={option.iso} value={option.iso}>
                {!isWindows &&
                  (emoji(option.iso) ? `${emoji(option.iso)} ` : "") +
                    option.name}
                {isWindows && option.name}
              </option>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Country;

export { emoji, Flag };
