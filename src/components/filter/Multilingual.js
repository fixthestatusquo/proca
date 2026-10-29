import React, { useEffect } from "react";
import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";
import { useTargets } from "@hooks/useTargets";
import { byLocale, languagesOf } from "@lib/targets";

const FilterMultilingual = ({ form }) => {
  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const { all, setFilter } = useTargets();
  const country = form.watch("country");
  const multilingual = config.component.email?.filter?.includes("multilingual");
  const locale = config.locale;

  useEffect(() => {
    if (!multilingual) {
      setFilter("multilingual", null);
      return;
    }
    const base = locale?.split("_")[0]?.toLowerCase();
    setFilter("multilingual", base ? { qualify: byLocale(base) } : null);
  }, [multilingual, locale, setFilter]);

  useEffect(() => {
    if (!multilingual || !all.length || !country) return;
    const c = country.toLowerCase();
    const langs = languagesOf(
      all.filter(t => t.country === c && t.lang),
      "lang"
    ).map(lang => lang.toLowerCase());
    if (langs.length !== 1) return;
    const [lang] = langs;
    if (locale?.toLowerCase().startsWith(lang)) return;
    const next = lang.length === 2 ? `${lang}_${c.toUpperCase()}` : lang;
    setConfig(current => ({ ...current, locale: next }));
  }, [all, country, multilingual, locale, setConfig]);

  return null;
};

export default FilterMultilingual;
