import React from "react";
import Register from "@components/Register";
import { Container, CardHeader } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import Alert from "@material-ui/lab/Alert";

const RegisterEmail = (props) => {
  const config = useCampaignConfig();
  const { t, i18n } = useTranslation();

  return (
    <>
      {props.submitted && (
        <Alert className="eci-success" severity="success">
          {t("eci:congratulations.successfully-title")}
        </Alert>
      )}
      <Container component="div" maxWidth="sm">
        {!!props.intro &&
          t("consent.intro", {
            name: config.organisation,
            campaign: config.campaign.title,
          })}{" "}
      </Container>
      {i18n.exists("step.register.title") && (
        <CardHeader title={t("step.register.title", "")} />
      )}
      <Register {...props} consentIntro={false} buttonNext="No Thanks" />
    </>
  );
};

export default RegisterEmail;
