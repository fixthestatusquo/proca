import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";

import CheckboxConsent from "@components/consent/Checkbox";
import ButtonConsent from "@components/consent/Button";
import RadioConsent from "@components/consent/Radio";
import ImplicitConsent from "@components/consent/Implicit";

const Consent = props => {
  const config = useCampaignConfig();

  if (config.component.consent?.implicit != null)
    // nullish is on purpose, it needs to catch both undefined and null
    return <ImplicitConsent {...props} />;

  if (config.component.consent?.buttons) {
    return null;
  }

  if (config.component?.consent?.checkbox)
    return <CheckboxConsent {...props} />;

  if (config.component?.consent?.button) return <ButtonConsent {...props} />;

  return <RadioConsent {...props} />;
};

export default Consent;
