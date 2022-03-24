import React, { useRef, useImperativeHandle } from "react";

const StripeInput = (props) => {
  const elementRef = useRef();
  const Component = props.component;

  useImperativeHandle(props.inputRef, () => ({
    focus: () => elementRef.current.focus,
  }));

  // I don't know why but stripe is undefined / false on re-render,
  // On the other hand, it works fine if we just ignore it's state.
  // if (!props.stripe) {
  //   console.log("waiting for stripe");
  //   return null;
  // }

  return (
    <Component
      stripe={props.stripe}
      //supportedCountries={["FR"]}
      onReady={(element) => (elementRef.current = element)}
      {...props}
    />
  );
};
export default StripeInput;
