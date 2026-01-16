import Select from "@components/field/Select";
import { useSetCampaignConfig } from "@hooks/useConfig";
import { useEffect } from "react";

const FilterLanguage = props => {
  const { watch } = props.form;
  //  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const language = watch("language");

  const selectLanguage = event => {
    console.log(event.target);
    const language = event.target.value;
    let select = props.profiles
      .filter(d => d.lang === language)
      .map(d => d.procaid);
    if (select.length === 0 && language.length > 2) {
      // we deal with fr_BE or de_AT...
      const lang = language.slice(0, 2);
      select = props.profiles.filter(d => d.lang === lang).map(d => d.procaid);
    }
    if (select.length > 0) {
      setConfig(current => {
        // we are forcing to reload the letter
        const next = { ...current };
        next.locale = language;
        return next;
      });
    }
    props.selecting(() => select);
  };

  return (
    <Select
      form={props.form}
      name="language"
      label="Language"
      options="campaign:languages"
      select="key"
      onChange={selectLanguage}
    />
  );
};

export default FilterLanguage;
