import React, { useEffect, useMemo } from "react";
import useData from "../hooks/useData";

import TextField from "./TextField";
import { useTranslation } from "react-i18next";
import useGeoLocation from "react-ipgeolocation";
import { useCampaignConfig } from "../hooks/useConfig";

import { allCountries } from "../lib/i18n";
import countriesJson from "../data/countries.json";
// import {allCountries} from '../lib/i18n'; and use instead XXX
let countries = [];

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

const Flag = (props) => {
  const country = props.country?.toUpperCase();
  const name = countries.find((d) => d.iso === country);
  if (!name) return null;
  const d = emoji(country);
  return <span title={name.name}>{d}</span>;
};

export default (props) => {
  const config = useCampaignConfig();
  const [, setData] = useData();
  if (props.countries) {
    countries = Object.keys(props.countries).map((iso) => ({
      iso: iso.toUpperCase(),
      name: props.countries[iso],
    }));
  } else {
    countries = countriesJson;
  }
  const compare = new Intl.Collator(config.lang.toLowerCase()).compare;
  countries.sort((a, b) => compare(a.name, b.name));

  if (props.other) {
    // no idea why we have useMemo here
    countries = useMemo(() => addMissingCountries(countries, compare), [
      compare,
    ]);
  }

  const { t } = useTranslation();

  const { register, setValue, watch } = props.form;

  if (props.list === false) return null;

  const country = watch("country") || "";
  const location = useGeoLocation({
    api: "https://country.proca.foundation",
    country: config.data.country || config.component.country,
  });
  useEffect(() => {
    if (location.country && !country) {
      if (!countries.find((d) => d.iso === location.country)) {
        console.log("visitor from ", location, "but not on our list");
        location.country = countries.find((d) => d.iso === "ZZ") ? "ZZ" : ""; // if "other" exists, set it
      }
      if (!location.country) return;

      setValue("country", location.country);
      setData("country", country);
    }
  }, [location, country, setValue, setData]);

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
      {countries.map((option) => (
        <option key={option.iso} value={option.iso}>
          {(emoji(option.iso) ? emoji(option.iso) + " " : "") + option.name}
        </option>
      ))}
    </TextField>
  );
};

export { emoji, Flag };
