import React from "react";
import usePaypal from "../hooks/usePaypal";
import useData from "../hooks/useData";
import { useCampaignConfig } from "../hooks/useConfig";

const PaypalButton = (props) => {
  const [data] = useData();
  const config = useCampaignConfig();

  const currency = config?.component?.DonateAmount?.currency || {
    symbol: "€",
    code: "EUR",
  };

  const ButonPaypal = usePaypal({
    currency: currency,
    amount: data.amount,
  });

  return (
    <div id="paypal-container">
      <ButonPaypal />
    </div>
  );
};

export default PaypalButton;
