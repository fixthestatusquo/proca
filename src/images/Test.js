import React from "react";

const SvgPattern = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <pattern
        id="pattern_proca_test"
        patternUnits="userSpaceOnUse"
        width="19.5"
        height="19.5"
        patternTransform="rotate(45)"
      >
        <line x1="0" y="0" x2="0" y2="19.5" stroke="#F4F980" strokeWidth="21" />
      </pattern>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#pattern_proca_test)"
      opacity="1"
    />
  </svg>
);

export default SvgPattern;
