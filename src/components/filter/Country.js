import React, { useEffect } from "react";
import Country from "@components/field/Country";
//import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";

const FilterCountry = props => {
  const { watch } = props.form;
//  const config = useCampaignConfig();
//  const setConfig = useSetCampaignConfig();
  const country = watch("country");

  useEffect(() => {
// TODO: move the filtering of profiles from Mail component to here
  }, [country, props.country]);

  return (
    <Country form={props.form} />
  );
};

export default FilterCountry;
