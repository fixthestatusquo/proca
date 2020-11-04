import React, {useEffect} from 'react';
import useData from "../../hooks/useData";

import TextField from "../TextField";
import { useTranslation } from "react-i18next";
import useGeoLocation from "react-ipgeolocation";
import {useCampaignConfig} from "../../hooks/useConfig";

import { Container, Grid } from "@material-ui/core";


import countries from "../../data/countries.json";

const emoji = country => {
  const offset = 127397;
  let emoji = '';

  if (!country || country.toUpperCase() === "ZZ") return "";

  country.toUpperCase().split('').forEach(char=> 
    emoji += String.fromCodePoint(char.charCodeAt(0) + offset)
  );

  return emoji;
}

const Flag = (props) => {
  const country = props.country?.toUpperCase();
  const name = countries.find (d => (d.iso === country));
    if (!name) return null;
    const d = emoji (country);
    return <span title={name.name}>{d}</span>;
}

export default (props)  => {
  const config = useCampaignConfig();
  const [, setData] = useData();

  const {t} = useTranslation();

  const {
    register,
    setValue,
    watch,
  } = props.form;

  if (props.list === false) return null;

  const country = watch("nationality") || "";
  const location = useGeoLocation({api:"https://country.proca.foundation", country: config.data.nationality || config.component.country });
  useEffect (() => {
    if (location.country && !country) {
      if (!countries.find (d => (d.iso === location.country))) {
        console.log ("visitor from ",location, "but not on our list");
        location.country = countries.find (d => (d.iso === "ZZ")) ? "ZZ" : ""; // if "other" exists, set it
      }
      if (!location.country)
        return;

      setValue("nationality", location.country);
      setData("nationality",country);
    }
  },[location,country,setValue,setData]);


  useEffect(() => {
    register({ name: "nationality" });
  }, [register]);


return (
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              select
              name="nationality"
              label={t("eci:form.support_country_selected")}
              form={props.form}
              SelectProps={{
                native: true,
              }}
  >
               <option key="" value=""></option>
              {countries.map(option => (
                <option key={option.iso} value={option.iso}>
                {(emoji(option.iso) ? emoji(option.iso) + " ": "") + option.name}
                </option>
              ))}
            </TextField>

</Grid>
</Grid>
</Container>
);
  
}

export {emoji, Flag};
