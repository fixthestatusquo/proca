import React from "react";
import ReactDOM from "react-dom";
import TestBackground from "../images/Test.js";

const Test = (props) => {
  const dom = document.body;
  return ReactDOM.createPortal(
    <>
      <TestBackground />
      AAAAAA{" "}
    </>,
    dom
  );
};

export default Test;
