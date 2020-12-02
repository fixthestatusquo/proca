import React, { useRef, useImperativeHandle } from "react";

const StripeInput = ({ component: Component, inputRef, ...props }) => {
  const elementRef = useRef();
  useImperativeHandle(inputRef, () => ({
    focus: () => elementRef.current.focus,
  }));
  if (!props.stripe) {
    console.log("waiting for stripe");
    return null;
  }

  console.log(props.stripe);
  return (
    <Component
      stripe={props.stripe}
      supportedCountries={["FR"]}
      onReady={(element) => (elementRef.current = element)}
      {...props}
    />
  );
};
export default StripeInput;
