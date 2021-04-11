import React from "react";
import { Trans, useTranslation } from "react-i18next";

const T = (props) => {
  const { t } = useTranslation();
  const tbr = (key) => t(key).replace(/\n/g, "<br />");
  return <Trans t={tbr} i18nKey={props.message}></Trans>;
  //return /* i18next-extract-disable-line */ t(props.message);
};

export default T;
