import React, { useEffect, useState } from "react";
import useData from "../../hooks/useData";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton";
import { useCampaignConfig } from "../../hooks/useConfig";
import dispatch from "../../lib/event";

const Paypal = ({ onError, onComplete }) => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  const [formData] = useData();
  const frequency = formData.frequency;

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
        onComplete={onComplete}
        onError={onError}
        frequency={frequency}
      />
    </PayPalScriptProvider>
  );
};

export default Paypal;
