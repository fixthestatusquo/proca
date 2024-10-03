import React from "react";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import Country from "@components/field/Country";
import Alert from "@material-ui/lab/Alert";

import Postcode from "@components/field/Postcode";
import TextField from "@components/TextField";
//import { imports } from "../../actionPage";
import { imports } from "../../actionPage";

const Filter = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  let r = [];

  /*  if (
    //done
    config.component.email?.filter?.includes("country") &&
    typeof config.component.country !== "string"
  ) {
    r.push(() => (
      <Country form={props.form} list={config.component.email?.countries} />
    ));
  }
  if (config.component.email?.filter?.includes("postcode")) {
    r.push(() => (
      <>
        <Postcode form={props.form} width={12} search={true} />
        {!props.form.getValues("postcode") && (
          <Alert severity="info">{t("target.postcode.undefined")}</Alert>
        )}
        <input type="hidden" {...props.form.register("area")} />
        <input type="hidden" {...props.form.register("constituency")} />
      </>
    ));
  }
*/

  const Filters =
    Object.entries(imports)
      .filter(([key]) => key.startsWith("filter"))
      .map(([, components]) => components) || [];

  if (
    config.component.email?.filter?.includes("multilingual") &&
    props.country
  ) {
    //    const ml = mainLanguage(props.country, false);
    if (props.languages.length > 1) {
      const names = config.component?.email?.locale || [];
      r.push(() => (
        <TextField
          select
          name="language"
          label={t("Language")}
          form={props.form}
          onChange={(e) => {
            props.filterLocale(e.target.value);
          }}
          SelectProps={{
            native: true,
          }}
        >
          {!props.languages.includes(config.locale) && (
            <option key="" value="" />
          )}
          {props.languages.map((option) => (
            <option key={option} value={option}>
              {names[option] || option}
            </option>
          ))}
        </TextField>
      ));
    }
  }
  if (Array.isArray(config.component.email?.filter)) {
    config.component.email.filter.forEach((d) => {
      const data =
        config.component.email?.data && config.component.email?.data[d];
      if (!data) return null;
      alert("TODO email.filter");
      r.push(() => (
        <TextField
          select
          name={d}
          label={/* i18next-extract-disable-line */ t(d)}
          form={props.form}
          onChange={(e) => {
            props.selecting(d, e.target.value);
          }}
          SelectProps={{
            native: true,
          }}
        >
          <option key="" value="" />

          {data.map((option) => (
            <option key={option.key} value={option.key}>
              {option.value}
            </option>
          ))}
        </TextField>
      ));
    });
  }
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
        />
      ))}
    </>
  );
};

export default Filter;
