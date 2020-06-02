import React from "react";
import { useTranslation } from "react-i18next";

import ProgressCounter from "./ProgressCounter";
import Register from "./Register";


export default function SignatureForm(props) {
  const { t } = useTranslation();

  return (
    <div>
      <ProgressCounter actionPage={props.actionPage} />
      <Register{...props} buttonText={t("Sign now!")}/>
    </div>
  );
}
