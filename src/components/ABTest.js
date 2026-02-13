import React, { useEffect, useRef } from "react";
import { useComponentConfig, useSetCampaignConfig } from "@hooks/useConfig";
import { merge } from "@lib/object";
import dispatch from "@lib/event.js";

let tested = false;
const setVariant = value => {
  const url = new URL(window.location.href);
  dispatch("ab_variant", { variant: value });
  url.searchParams.set("utm_content", value);
  window.history.replaceState(null, "", url);
};

const ABTest = () => {
  const component = useComponentConfig();
  const setConfig = useSetCampaignConfig();

  const variants = component.test;
  useEffect(() => {
    if (!variants?.length || tested) return;
    tested = true;
    const variant = Math.floor(Math.random() * variants.length);
    setVariant(variants[variant].name || String.fromCharCode(65 + variant));
    setConfig(current => {
      const config = { component: variants[variant].component };
      console.log("AB", current, config, merge(current, config));
      //      const next = { ...current };
      //      next.component.register.field.phone = true;
      return merge(current, config);
    });
  }, [variants]);

  return null;
};

export default ABTest;
