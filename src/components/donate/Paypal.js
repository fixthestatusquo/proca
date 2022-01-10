import React from "react";
import useData from "../../hooks/useData";
import PayPalButton from "./PayPalButton";

const Paypal = ({ onError, onComplete }) => {
  const [formData] = useData();

  return (
    <PayPalButton
      onComplete={onComplete}
      onError={onError}
      forceReRender={[formData.amount]}
    />
  );
};

export default Paypal;
