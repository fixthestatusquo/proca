import React from "react";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import { AlertTitle } from '@mui/material';
import Alert from "@components/Alert";
// used when returning from email confirmation (double opt-in or action confirm)
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
