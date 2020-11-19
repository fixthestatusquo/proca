import React, { useState, useRef, useEffect } from "react";
import usePaypal from "../hooks/usePaypal";

const PaypalButton = (props) => {
  const ButonPaypal = usePaypal({
    currency: props.currency || "EUR",
    amount: props.amount,
    recurring: props.recurring,
  });
  console.log(props);

  return (
    <Button component="div" disabled={!amount} id="paypal-container">
      <ButonPaypal />
    </Button>
  );
};

export default PaypalButton;
