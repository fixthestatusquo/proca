import React, { useEffect, useMemo, useRef } from "react";
import {
  useCampaignConfig as useOriginalCampaignConfig,
  useComponentConfig,
  useSetCampaignConfig,
} from "@hooks/useConfig";
import { merge } from "@lib/object";
import dispatch from "@lib/event.js";

let tested = false;

const setVariant = value => {
  const url = new URL(window.location.href);
  dispatch("ab_variant", { variant: value });
  url.searchParams.set("utm_content", value);
  window.history.replaceState(null, "", url);
};

const getVariant = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("utm_content");
};

/**
 * useCampaignConfig reads the current campaign config and, if a variant
 * is present in the URL (utm_content), merges that variant's component
 * overrides into the config. Returns the (possibly modified) config.
 *
 * Overrides @hooks/useConfig's useCampaignConfig — import this one
 * when you want AB test variant resolution.
 */
export const useCampaignConfig = () => {
  const config = useOriginalCampaignConfig();
  return useMemo(() => {
    if (!config?.component?.test) return config;
    const variantId = getVariant();
    if (!variantId) return config;
    const variants = config.component.test;
    let index = variants.findIndex(d => d.name === variantId);
    if (index === -1 && variantId.length === 1)
      index = variantId.charCodeAt(0) - 65;
    if (typeof index !== "number" || index >= variants.length) return config;
    return merge(config, { component: variants[index].component });
  }, [config]);
};

const ABTest = ({ sticky = false }) => {
  const component = useComponentConfig();
  const setConfig = useSetCampaignConfig();
  const variants = component.test;
  useEffect(() => {
    if (!variants?.length || tested) return;
    tested = true;
    let variant = sticky && getVariant();
    if (sticky) {
      const param = getVariant();
      let index = variants.findIndex(d => d.name === param);
      if (index === -1 && param.length === 1) index = param.charCodeAt(0) - 65;
      if (typeof index === "number" && index < variants.length) variant = index;
      console.log("sticky", index, variant, param);
    }
    if (!variant) {
      variant = Math.floor(Math.random() * variants.length);
    }
    setVariant(variants[variant].name || String.fromCharCode(65 + variant));
    const config = { component: variants[variant].component };
    //TODO, handle variants on layout, locale and portal
    console.log(config);
    setConfig(config);
  }, [variants, sticky]);

  return null;
};

export default ABTest;
