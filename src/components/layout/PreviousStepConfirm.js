import React from "react";
import { useTranslation } from "react-i18next";
import useData from "@hooks/useData";
import MailIcon from "@material-ui/icons/MailOutline";
import { AlertTitle } from "@material-ui/lab";
import Alert from "@components/Alert";

const PreviousStepConfirm = (props) => {
  const { t, i18n } = useTranslation();
  const [data] = useData();

  const ConfirmTitle = (props) =>
    i18n.exists("consent.emailSent") && (
      <AlertTitle>{t("consent.emailSent", { email: props.email })}</AlertTitle>
    );

  if (
    props.email?.confirmOptIn &&
    (data.privacy === "opt-in" || data.privacy === "opt-in-both")
  ) {
    return (
      <Alert severity="info" autoHideDuration={15000} icon={<MailIcon />}>
        <ConfirmTitle email={data.email} />
        {t("consent.confirmOptIn")}
      </Alert>
    );
  }

  if (props.email?.confirmAction && data.privacy) {
    return (
      <Alert severity="warning" autoHideDuration={15000} icon={<MailIcon />}>
        <ConfirmTitle email={data.email} />
        {t("consent.confirmAction", { email: data.email })}
      </Alert>
    );
  }
  if (data.privacy) {
    // we saved previously
    return (
      <Alert severity="success">
        {t([
          "campaign:thanksAfterAction",
          "campaign:thanks_after_action",
          "Thank you",
        ])}
      </Alert>
    );
  }
  return null;
};

export default PreviousStepConfirm;
