import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import Country from "@components/field/Country";
import Alert from "@material-ui/lab/Alert";

import Postcode from "@components/field/Postcode";
import TextField from "@components/TextField";
//import { imports } from "../../actionPage";
import { imports } from "../../actionPage";

const Filter = props => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const Filters =
    Object.entries(imports)
      .filter(([key]) => key.startsWith("filter"))
      .map(([, components]) => components) || [];
  let nbFilters = Filters.length;
  
  if (config.component.email?.filter) {
    nbFilters += config.component.email?.filter?.length;
  } 
  if (nbFilters === 0 && props.maxProfiles === 0) {
    nbFilters = undefined; // nothing to filter anyway
  }
  useEffect (() => {
     if (nbFilters !== 0) return;
console.log("we need to select everything, there aren't any filter");
     props.selecting ( () => true); // return all the profiles
  }
  ,[nbFilters]);

  return (
    <>
      {config.component.email?.filter?.includes("country") &&
        typeof config.component.country !== "string" && (
          <Country form={props.form} list={config.component.email?.countries} />
        )}
      {config.component.email?.filter?.includes("postcode") && (
        <>
          <Postcode form={props.form} width={12} search={true} />
          {!props.form.getValues("postcode") && (
            <Alert severity="info">{t("target.postcode.undefined")}</Alert>
          )}
          <input type="hidden" {...props.form.register("area")} />
          <input type="hidden" {...props.form.register("constituency")} />
        </>
      )}
      {Filters.map((Component, index) => (
        <Component
          key={index}
          form={props.form}
          country={props.country}
          selecting={props.selecting}
          profiles={props.profiles}
          languages={props.languages}
        />
      ))}
    </>
  );
};

export default Filter;
