import React, { useEffect, useState, useMemo } from "react";
import useData from "@hooks/useData";
import { get } from "@lib/urlparser";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import useGeoLocation from "react-ipgeolocation";
import { useCampaignConfig } from "@hooks/useConfig";
import { useIsWindows } from "@hooks/useDevice";
import Alert from "@material-ui/lab/Alert";

import { allCountries } from "@lib/i18n";
//import countriesJson from "../data/countries.json";
import countriesJson from "../../data/eu27.json";

const emoji = (country) => {
  const offset = 127397;
  let emoji = "";

  if (!country || country.toUpperCase() === "ZZ") return "";

  country
    .toUpperCase()
    .split("")
    .forEach(
      (char) => (emoji += String.fromCodePoint(char.charCodeAt(0) + offset)),
    );

  return emoji;
};

export const addMissingCountries = (countries, compare) => {
  const alreadyHave = {};

  countries.reduce((a, c) => {
    a[c.iso] = true;
    return a;
  }, alreadyHave);

  let others = [];
  for (const [code, label] of Object.entries(allCountries)) {
    if (!(code in alreadyHave)) {
      others.push({ iso: code, name: label });
    }
  }
  others.sort((a, b) => compare(a.name, b.name));
  return countries.filter(({ iso }) => iso !== "ZZ").concat(others);
};

const addAllCountries = () => {
  const d = [];
  for (const [code, label] of Object.entries(allCountries)) {
    d.push({ iso: code, name: label });
  }
  return d;
};

/*const iso = (list) => {
  let d = [];
  list.map((country) => d.push(country.iso));
  return d;
};*/

const addCountries = (list) => {
  let d = [];
  list.map((country) => {
    country !== "ZZ" &&
      d.push({ iso: country, name: allCountries[country] || "" });
    return null;
  });
  return d;
};

const Flag = (props) => {
  const country = props.country?.toUpperCase();
  const d = emoji(country);
  return <span title={"flag " + d}>{d}</span>;
};

const Country = (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const [_countries, setCountries] = useState([]);
  const [, setData] = useData();
  const isWindows = useIsWindows();
  const countries = useMemo(() => {
    let countries = [];
    if (props.countries) {
      countries = Object.keys(props.countries).map((iso) => ({
        iso: iso.toUpperCase(),
        name: props.countries[iso] || allCountries[iso],
      }));
    } else {
      countries = addCountries(countriesJson, t);
    }

    const compare = new Intl.Collator(config.lang.substring(0, 2).toLowerCase())
      .compare;
    countries.sort((a, b) => compare(a.name, b.name));
    if (config.component.country?.all === true) {
      countries = addAllCountries();
    }
    if (config.component.country?.other !== false) {
      countries.push({ iso: "ZZ", name: t("Other") });
    }
    if (false || props.other) {
      countries = addMissingCountries(countries, compare);
    }
    return countries;
  }, [
    config.component.country?.all,
    config.component.country?.other,
    config.lang,
    props.countries,
    props.other,
    t,
  ]);

  const { setValue, getValues } = props.form;

  let defaultCountry = get("country"); //fetch from the url if set
  if (!defaultCountry && config.component.country !== undefined) {
    defaultCountry = config.component.country;
    if (typeof defaultCountry === "string")
      defaultCountry = defaultCountry.toUpperCase();
  }
  if (getValues("country")) {
    defaultCountry = getValues("country");
  }
  const location = useGeoLocation({
    api: "https://country.proca.foundation",
    country: defaultCountry,
  });

  const switchCountry = (e) => {
    setData("country", e.target.value);
  };

  const countriesLength = _countries.length;

  useEffect(() => {
    const country = getValues("country") || "";
    if (location.country === country && countriesLength !== 0) return;
    if (location.country && (!country || typeof country !== "string")) {
      if (!countries.find((d) => d.iso === location.country)) {
        console.log("visitor from ", location?.country, "but not on our list");
        countries.unshift({
          iso: location.country,
          name: allCountries[location.country] || t("Other"),
        });
        //        location.country = countries.find((d) => d.iso === "ZZ") ? "ZZ" : ""; // if "other" exists, set it
      }
      setCountries(countries);
      if (!location.country) return; // not sure how it can happen, remove?
      setValue("country", location.country);

      setData("country", country);
    } else {
      // geoLocation doesn't work
      setCountries(countries);
    }
  }, [location, getValues, countries, setValue, setData, t, countriesLength]);

  //  useEffect(() => {
  //    register({ name: "country" });
  //  }, [register]);

  if (props.list === false) return null;

  // Windows doesn't support flag emojis
  return (
    <>
      <TextField
        required={props.required}
        select
        name="country"
        onChange={switchCountry}
        label={t("Country")}
        form={props.form}
        SelectProps={{
          native: true,
        }}
      >
        <option key="" value=""></option>

        {_countries.map((option) => (
          <option key={option.iso} value={option.iso}>
            {!isWindows &&
              (emoji(option.iso) ? emoji(option.iso) + " " : "") + option.name}
            {isWindows && option.name}
          </option>
        ))}
      </TextField>
      {config.component.country === false && !defaultCountry && (
        <Alert severity="info">{t("target.country.undefined")}</Alert>
      )}
    </>
  );
};

export default Country;
export { emoji, Flag };
