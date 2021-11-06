import React, { useEffect, useState } from "react";
import useData from "../hooks/useData";

import TextField from "./TextField";
import { useTranslation } from "react-i18next";
import useGeoLocation from "react-ipgeolocation";
import { useCampaignConfig } from "../hooks/useConfig";

import { allCountries } from "@lib/i18n";
//import countriesJson from "../data/countries.json";
import countriesJson from "../data/eu27.json";

const emoji = (country) => {
  const offset = 127397;
  let emoji = "";

  if (!country || country.toUpperCase() === "ZZ") return "";

  country
    .toUpperCase()
    .split("")
    .forEach(
      (char) => (emoji += String.fromCodePoint(char.charCodeAt(0) + offset))
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

const addCountries = (list, t) => {
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

export default (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const [_countries, setCountries] = useState([]);
  const [, setData] = useData();

  let countries = [];
  if (props.countries) {
    countries = Object.keys(props.countries).map((iso) => ({
      iso: iso.toUpperCase(),
      name: props.countries[iso],
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

  const { register, setValue, watch } = props.form;

  if (props.list === false) return null;

  const country = watch("country") || "";
  const location = useGeoLocation({
    api: "https://country.proca.foundation",
    country: config.data.country || config.component.country,
  });
  useEffect(() => {
    if (location.country === country) return;

    if (location.country && !country) {
      if (!countries.find((d) => d.iso === location.country)) {
        console.log("visitor from ", location?.country, "but not on our list");
        countries.unshift({
          iso: location.country,
          name: allCountries[location.country] || t("Other"),
        });
        //        location.country = countries.find((d) => d.iso === "ZZ") ? "ZZ" : ""; // if "other" exists, set it
      } else {
      }
      setCountries(countries);
      if (!location.country) return;
      setValue("country", location.country);
      setData("country", country);
    }
  }, [location, country, countries, setValue, setData, t]);

  useEffect(() => {
    register({ name: "country" });
  }, [register]);

  return (
    <TextField
      select
      name="country"
      label={t("Country")}
      form={props.form}
      SelectProps={{
        native: true,
      }}
    >
      <option key="" value=""></option>
      {_countries.map((option) => (
        <option key={option.iso} value={option.iso}>
          {(emoji(option.iso) ? emoji(option.iso) + " " : "") + option.name}
        </option>
      ))}
    </TextField>
  );
};

export { emoji, Flag };
