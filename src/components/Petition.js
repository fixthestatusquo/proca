import React from "react";
import { useTranslation } from "react-i18next";

import ProgressCounter from "./ProgressCounter";
import Register from "./Register";


export default function SignatureForm(props) {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ProgressCounter actionPage={props.actionPage} />
      <Register{...props} buttonText={t("Sign now!")}/>
    </React.Fragment>
  );
}
