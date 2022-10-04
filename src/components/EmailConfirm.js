import React from "react";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import { AlertTitle } from "@material-ui/lab";
import Alert from "@components/Alert";

const EmailConfirm = () => {
  const { t } = useTranslation();
  const params = new URL(window.location.href).searchParams;

  if (
    params.get("proca_confirm") === "accept" ||
    params.get("proca_doi") === "1"
  ) {
    const msg =
      params.get("proca_confirm") === "accept"
        ? t("consent.actionConfirmed")
        : t("consent.optInConfirmed");
    return (
      <Alert severity="success" autoHideDuration={15000} icon={<CheckIcon />}>
        <AlertTitle>{msg}</AlertTitle>
      </Alert>
    );
  }
  if (params.get("proca_confirm") === "reject") {
    return (
      <Alert severity="success" autoHideDuration={15000} icon={<DeleteIcon />}>
        <AlertTitle> {t("consent.actionRejected")}</AlertTitle>
      </Alert>
    );
  }
  return <></>;
};

export default EmailConfirm;
