import React from "react";
import Register from "../Register";
import { Button } from "@material-ui/core";
import { useCampaignConfig } from "../../hooks/useConfig";
import { useTranslation } from "react-i18next";
import SkipNextIcon from "@material-ui/icons/SkipNext";

const RegisterEmail = (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  return (
    <>
      <div>
        {" "}
        {t("consent.intro", {
          name: config.organisation,
          campaign: config.campaign.title,
        })}{" "}
      </div>

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
