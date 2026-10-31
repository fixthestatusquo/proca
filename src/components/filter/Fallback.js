import { useEffect } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTargets } from "@hooks/useTargets";
import { sample } from "@lib/array";

const FilterFallback = ({ form }) => {
  const config = useCampaignConfig();
  const { setFilter } = useTargets();
  const email = config.component.email || {};
  const area = form.watch("area");
  const constituency = form.watch("constituency");
  const postcode = form.watch("postcode");
  const enabled = !!(
    email.fallbackArea ||
    email.fallbackRandom ||
    email.filter?.includes("fallback") ||
    constituency
  );

  useEffect(() => {
    if (!enabled) {
      setFilter("fallback", null);
      return;
    }
    setFilter("fallback", {
      order: 1000,
      runoff: (list, all) => {
        if (list.length) return list;
        if (email.filter?.includes("postcode") && !area && !constituency) {
          return list;
        }
        if (email.fallbackArea) {
          if (area) {
            const inArea = all.filter(t => String(t.area) === String(area));
            return inArea.length ? inArea : list;
          }
          if (typeof email.fallbackArea === "string") {
            return all.filter(
              t => t.country === email.fallbackArea.toLowerCase()
            );
          }
          return list;
        }
        if (email.fallbackRandom) {
          return all.length
            ? sample(all, email.sample || email.fallbackRandom)
            : [];
        }
        if (constituency) return all.filter(t => t.fallback === true);
        return list;
      },
    });
  }, [
    enabled,
    email.fallbackArea,
    email.fallbackRandom,
    email.filter,
    email.sample,
    area,
    constituency,
    postcode,
    setFilter,
  ]);

  return null;
};

export default FilterFallback;
