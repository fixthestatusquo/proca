import React from "react";
import { useTranslation } from "react-i18next";

import ProgressCounter from "./ProgressCounter";
import Register from "./Register";
import Closed from "./Closed";
import { useCampaignConfig } from "@hooks/useConfig";

export default function SignatureForm(props) {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  if (config.component.widget?.closed) return <Closed />;

  return (
    <React.Fragment>
      <ProgressCounter actionPage={props.actionPage} />
      <Register {...props} buttonText={t("Sign now!")} />
    </React.Fragment>
  );
}
