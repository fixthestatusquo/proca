import React from "react";
import useData from "../../hooks/useData";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./buttons/PayPal";
import { useCampaignConfig } from "../../hooks/useConfig";

const Paypal = ({ onError, onComplete, disabled }) => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  const [formData] = useData();
  const frequency = formData.frequency || "oneoff";

  const providerOptions = {
    "client-id": donateConfig.paypal.clientId,
    currency: donateConfig.currency.code,
  };
  if (frequency !== "oneoff") {
    providerOptions["intent"] = "subscription";
    providerOptions["vault"] = "true";
  }

  return (
    <PayPalScriptProvider options={providerOptions}>
      <PayPalButton
        disabled={disabled}
        onComplete={onComplete}
        onError={onError}
        frequency={frequency}
      />
    </PayPalScriptProvider>
  );
};

export default Paypal;
