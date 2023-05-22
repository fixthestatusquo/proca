import * as React from "react";

const ProcaLogo = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle fillOpacity="0.05" cx="16" cy="16" r="16" />
    <linearGradient
      id="a"
      gradientUnits="userSpaceOnUse"
      x1="5"
      y1="28"
      x2="17"
      y2="16"
    >
      <stop offset="0" stopColor="#ff5c39" />
      <stop offset=".8" stopColor="#485cc7" />
    </linearGradient>
    <linearGradient
      id="i"
      gradientUnits="userSpaceOnUse"
      x1="5"
      y1="28"
      x2="17"
      y2="16"
    >
      <stop offset="0" stopOpacity="0.4" />
      <stop offset=".8" stopOpacity="0.1" />
    </linearGradient>
    <path
      fill="url(#i)"
      d="M7.174 12.066.006 16.266c.104 6.341 3.894 11.782 9.323 14.277L15.597 26.872V16.928L7.174 12.066z"
    />
    <path d="M7.174 12.066 15.597 16.931v9.941l14.33-18.764z" />
  </svg>
);

export default ProcaLogo;
