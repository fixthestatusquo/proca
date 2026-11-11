
import TextField from "@components/field/TextField";
import { useTargets } from "@hooks/useTargets";
import { byConstituency } from "@lib/targets";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const FilterConstituency = ({ form }) => {
  const { t } = useTranslation();
  const { all, setFilter } = useTargets();
  const constituency = form.watch("constituency");
  const country = form.watch("country")?.toLowerCase();
  const [constituencies, setConstituencies] = useState(null);

  useEffect(() => {
    if (!all.length) return;
    const list = new Set(
      all
        .filter(target => !country || target.country === country)
        .map(target => target.constituency)
        .filter(Boolean)
    );
    setConstituencies([...list].sort());
  }, [all, country]);

  useEffect(() => {
    setFilter(
      "constituency",
      constituency ? { qualify: byConstituency(constituency) } : null
    );
  }, [constituency, setFilter]);

  if (!constituencies) return null;
  return (
    <TextField
      select={true}
      name="constituency"
      required={true}
      label={t("Constituency")}
      form={form}
      SelectProps={{
        native: true,
      }}
    >
      <option key="empty" value="" />
      {constituencies.map(k => {
        return (
          <option key={k} value={k}>
            {k}
          </option>
        );
      })}
    </TextField>
  );
};

export default FilterConstituency;
