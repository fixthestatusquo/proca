import * as React from "react";

const SvgComponent = ({ size }) => (
  <svg viewBox="0 0 600 450" width={size} height={size}>
    <title>Gmail</title>
    <path
      d="M140.3 364.7h58.9v-143l-84.1-63.1v180.8c0 14 11.3 25.3 25.2 25.3z"
      fill="#517bbd"
    />
    <path
      d="M401.1 364.7H460c13.9 0 25.2-11.3 25.2-25.2V158.7l-84.1 63.1v142.9z"
      fill="#31a853"
    />
    <path
      d="M401.1 112.4v109.3l84.1-63.1V125c0-31.2-35.6-49-60.6-30.3l-23.5 17.7z"
      fill="#fbbc08"
    />
    <path
      d="M199.2 221.7V112.4l100.9 75.7L401 112.4v109.3l-100.9 75.7-100.9-75.7z"
      fillRule="evenodd"
      fill="#e84336"
    />
    <path
      d="M115.1 125v33.6l84.1 63.1V112.4l-23.6-17.7c-24.9-18.7-60.5-.8-60.5 30.3z"
      fill="#c6221f"
    />
  </svg>
);

export default SvgComponent;
