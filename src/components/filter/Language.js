import Select from "@components/field/Select";
import { useSetCampaignConfig } from "@hooks/useConfig";
import { useTargets } from "@hooks/useTargets";
import { byLocale } from "@lib/targets";
import { useEffect } from "react";

const FilterLanguage = ({ form }) => {
  const setConfig = useSetCampaignConfig();
  const { all, setFilter } = useTargets();
  const language = form.watch("language");
  const base = language?.length > 2 ? language.slice(0, 2) : language;

  useEffect(() => {
    setFilter("language", base ? { qualify: byLocale(base) } : null);
  }, [base, setFilter]);

  useEffect(() => {
    if (!language || all.length === 0) return;
    const matches = all.filter(byLocale(base));
    if (matches.length === 0) return;
    setConfig(current =>
      current.locale === language ? current : { ...current, locale: language }
    );
  }, [language, base, all, setConfig]);

  return (
    <Select
      form={form}
      name="language"
      label="Language"
      options="campaign:languages"
      select="key"
    />
  );
};

export default FilterLanguage;
