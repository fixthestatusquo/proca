import React, { useEffect } from "react";
import Select from "@components/field/Select";
import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const FilterLanguage = props => {
  const { watch } = props.form;
  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const language = watch("language");
  const { t } = useTranslation();

  use = useEffect(() => {
    if (!language) {
    props.selecting(
      "locale",
      config.locale
    );
    return;
    }


    props.selecting(
      "locale",
      language
    );

      setConfig(current => {
        console.log("set lang", language);
        const next = { ...current };
        next.lang = language;
        return next;
      });

  }, [language, props.country]);

  return <Select form={props.form} name="language"
          required
    options = "campaign:languages"
    select = "key"

/>;

};

export default FilterLanguage;
