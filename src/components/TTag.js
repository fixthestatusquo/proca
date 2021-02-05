import React from "react";
import { useTranslation, Trans } from "react-i18next";

const T = (props) => {
  const { t } = useTranslation();
  console.log(props.message);
  return <Trans i18nKey={props.message}></Trans>;
  //return /* i18next-extract-disable-line */ t(props.message);
};

export default T;
