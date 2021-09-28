import React, { useState } from "react";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton";
import { create as createURL } from "../../lib/urlparser.js";

// oneoff

const Paypal = ({ classes, onError, onComplete }) => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  return (
    <PayPalScriptProvider
      options={{
        "client-id": donateConfig.paypal.clientId,
        currency: donateConfig.currency.code
      }}
    >
      <PayPalButton onComplete={onComplete} onError={onError} />
    </PayPalScriptProvider>
  );
};

export default Paypal;
