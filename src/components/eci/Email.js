import React from "react";
import Register from "../Register";
import { Button } from "@material-ui/core";
import { useCampaignConfig } from "../../hooks/useConfig";
import { useTranslation } from "react-i18next";

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
      <Button fullWidth onClick={props.done}>
        Skip and go directly to signing the initiative in step 2
      </Button>
    </>
  );
};

export default RegisterEmail;
