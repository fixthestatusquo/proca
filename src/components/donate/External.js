import React from "react";
import { Button, Box } from "@material-ui/core";
import { utm } from "@lib/urlparser";
import dispatch from "@lib/event";
import uuid from "@lib/uuid";
import { addAction } from "@lib/server";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import DonationIcon from "@images/Donate";

const DonateButton = () => {
  const { org, component, actionPage, test, lang } = useCampaignConfig();
  const { t } = useTranslation();
  const [formData] = useData();

  if (!component.donation?.url) return null;
  const addDonate = event => {
    const d = {
      uuid: uuid(),
      tracking: utm(),
    };

    dispatch(event.replace("_", ":"), d, formData);
    addAction(actionPage, event, d, test); // there is keepAlive, no need to wait the result
  };

  const donate = () => {
    addDonate("donate");
    const url = component.donation.url
      .replace("{lang}", lang)
      .replace("{email}", formData.email || "")
      .replace("{lastname}", formData.lastname || "")
      .replace("{firstname}", formData.firstname || "")
      .replace("{postcode}", formData.postcode || "")
      .replace("{locality}", formData.locality || "")
      .replace("{country}", formData.country || "");
    window.location.href = url;
  };

  return (
    <Box px={1} pb={1}>
      <Button
        size="large"
        fullWidth
        endIcon={<DonationIcon />}
        variant="contained"
        color="secondary"
        onClick={donate}
      >
        {t(["action.donate", "donation.to"], { organisation: org.name })}
      </Button>
    </Box>
  );
};

export default DonateButton;
