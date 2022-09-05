import React from 'react';
import { useTranslation } from "react-i18next";
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import CheckIcon from '@material-ui/icons/CheckCircleOutline';
import { AlertTitle } from "@material-ui/lab";
import Alert from "@components/Alert";

const EmailConfirm = () => {
  const { t } = useTranslation();
  const params = new URL(window.location.href).searchParams;
  console.log("params", params, params.get("proca_confirm") )

  if (params.get("proca_confirm") === "accept" || params.get("proca_doi") === "1") {
    const msg = params.get("proca_confirm") === "accept"
      ? t("consent.actionConfirmed")
      : t("consent.optInConfirmed")
    return (
      <Alert severity="warning" autoHideDuration={15000} icon={<CheckIcon />}>
      <AlertTitle>{msg}</AlertTitle>
      </Alert>
    )
    }
  if (params.get("proca_confirm") === "reject") {
      return(
      <Alert severity="warning" autoHideDuration={15000} icon={<NotInterestedIcon />}>
        <AlertTitle> {t("consent.actionRejected")}</AlertTitle>
      </Alert>)
    }
  return (<></>);
}

export default EmailConfirm;