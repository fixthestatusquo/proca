import React, { useRef, useImperativeHandle } from "react";

const StripeInput = props => {
  const elementRef = useRef();
  const Component = props.component;

  useImperativeHandle(props.inputRef, () => ({
    focus: () => elementRef.current.focus,
  }));

  if (!props.stripe) {
    console.log("waiting for stripe");
    return null;
  }

  return (
    <Component
      stripe={props.stripe}
      //supportedCountries={["FR"]}
      onReady={element => (elementRef.current = element)}
      {...props}
    />
  );
};
export default StripeInput;
