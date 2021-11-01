import React from "react";
import { useTranslation } from "react-i18next";

import Register from "./Register";
import TTag from "./TTag";

export default function SignatureForm(props) {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <TTag message="campaign:closed" dangerouslySet={true} />
      <Register {...props} buttonText={t("register")} />
    </React.Fragment>
  );
}
