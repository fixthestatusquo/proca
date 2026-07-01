import React from "react";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

const NonEngagment = () => {
  const { t } = useTranslation();
  return (
    <Alert severity="error">
      {t("campaign:nonEngagement", {
        defaultValue: "Non Engagment with this party",
      })}
    </Alert>
  );
};

export default NonEngagment;
