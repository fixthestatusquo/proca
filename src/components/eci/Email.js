import React from "react";
import Register from "@components/Register";
import { Button, CardHeader } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import SkipNextIcon from "@material-ui/icons/SkipNext";
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
      <div>
        {!!props.intro &&
          t("consent.intro", {
            name: config.organisation,
            campaign: config.campaign.title,
          })}{" "}
      </div>
    {i18n.exists("step.register.title") && <CardHeader subheader={t("step.register.title","")}></CardHeader>}
      <Register {...props} consent-intro={false} />
      <Button
        endIcon={<SkipNextIcon />}
        fullWidth
        variant="contained"
        onClick={props.done}
      >
        {t("No Thanks")}
      </Button>
    </>
  );
};

export default RegisterEmail;
