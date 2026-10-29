import React, { useEffect } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTargets } from "@hooks/useTargets";
import { sample } from "@lib/array";

const FilterRandom = () => {
  const config = useCampaignConfig();
  const { setFilter } = useTargets();
  const email = config.component.email || {};
  const enabled = email.filter?.includes("random");
  const size = email.sample;

  useEffect(() => {
    if (!enabled) {
      setFilter("random", null);
      return;
    }
    setFilter("random", {
      order: 100,
      runoff: list => (list.length ? sample(list, size || 1) : []),
    });
  }, [enabled, size, setFilter]);

  return null;
};

export default FilterRandom;
