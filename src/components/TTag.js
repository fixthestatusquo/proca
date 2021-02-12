import React from "react";
import { Trans } from "react-i18next";

const T = (props) => {
  return <Trans i18nKey={props.message}></Trans>;
  //return /* i18next-extract-disable-line */ t(props.message);
};

export default T;
