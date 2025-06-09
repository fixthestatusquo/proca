import React, { useEffect } from "react";
import Select from "@components/field/Select";
import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";

const FilterLanguage = props => {
  const { watch } = props.form;
  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const language = watch("language");

  useEffect(() => {
    if (!language) {
      console.log("set language to locale", config.locale);
      props.selecting("locale", config.locale);
      return;
    }

    props.selecting("locale", language);

    setConfig(current => {
            console.log("set lang", language, props.country);
      const next = { ...current };
      next.lang = language;
      return next;
    });
  }, [language, props.country]);

  return (
    <Select
      form={props.form}
      name="language"
      label="Language"
      options="campaign:languages"
      select="key"
      required
    />
  );
};

export default FilterLanguage;
