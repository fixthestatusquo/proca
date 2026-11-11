import Country from "@components/field/Country";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { useTargets } from "@hooks/useTargets";
import { byCountry } from "@lib/targets";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const FilterCountry = ({ form }) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [, setData] = useData();
  const { all, setFilter } = useTargets();
  const country = form.watch("country");
  const fixed =
    typeof config.component.country === "string"
      ? config.component.country
      : null;
  const value = fixed || country;
  const countryFiltered = config.component.email?.filter?.includes("country");

  useEffect(() => {
    setFilter(
      "country",
      value ? { qualify: byCountry(value.toLowerCase()) } : null
    );
  }, [value, setFilter]);

  useEffect(() => {
    if (!countryFiltered || !value) return;
    const matches = all.filter(byCountry(value.toLowerCase()));
    if (all.length > 0 && matches.length === 0) {
      form.setError("country", {
        message: t("target.country.empty", { country: value }),
        type: "warning",
      });
    } else {
      form.clearErrors("country");
    }
    setData("country", value.toLowerCase());
  }, [all, value, countryFiltered, form, t, setData]);

  if (fixed) return null;
  return <Country form={form} />;
};

export default FilterCountry;
