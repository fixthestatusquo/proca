import React, {useEffect} from 'react';
import useConfig from '../hooks/useConfig';
import {
  TextField,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import useForm from "react-hook-form";
import useGeoLocation from "react-ipgeolocation";
import { Container, Grid } from "@material-ui/core";


import countries from "../data/countries.json";

export default (props)  => {
  const {config,setConfig} = useConfig();
  const {t} = useTranslation();

  const {
    register,
    setValue,
    watch,
  } = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: config.data
  });

  const country = watch("country") || "";
  const location = useGeoLocation({api:"https://country.proca.foundation"});
  if (location.country && !country) {
    if (!countries.find (d => (d.iso === location.country))) {
      console.log ("visitor from ",location, "but not on our list");
      location.country = countries.find (d => (d.iso === "ZZ")) ? "ZZ" : ""; // if "other" exists, set it
    }
    if (location.country)
      setValue("country", location.country);
  }

  useEffect(() => {
    if (country === "" || config.country === country)
      return; //nothing to update
//    console.log("set country before:after",config.country,country);
    setConfig("country",country);
  },[country,config,setConfig]);

  useEffect(() => {
    register({ name: "country" });
  }, [register]);

  const selectChange = e => {
    setValue("country", e.target.value);
  };

return (
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              select
              id="country"
              name="country"
              label={t("Country")}
              variant={config.variant}
              inputRef={register}
              //value={defaultValues.country}
              value={country}
              onChange={selectChange}
              InputLabelProps={{ shrink: country.length > 0 }}
              SelectProps={{
                native: true,
              }}
  >
               <option key="" value=""></option>
              {countries.map(option => (
                <option key={option.iso} value={option.iso}>
                  {option.name}
                </option>
              ))}
            </TextField>

</Grid>
</Grid>
</Container>
);
  
}
