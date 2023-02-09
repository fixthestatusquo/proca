import React from "react";
import { useTranslation } from "react-i18next";
import useCount from "@hooks/useCount";

import Register from "@components/Register";
import TTag from "@components/TTag";

export default function SignatureForm(props) {
  const { t } = useTranslation();
  const count = useCount();
  return (
    <React.Fragment>
      <TTag message="campaign:closed" dangerouslySet={true} total={count} />
      <Register {...props} buttonText={t("action.stayInformed")} />
    </React.Fragment>
  );
}
