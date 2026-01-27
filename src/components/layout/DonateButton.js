import React from "react";
import { Button, Box } from "@material-ui/core";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import DonationIcon from "@images/Donate";

const DonateButton = props => {
  const { org, component } = useCampaignConfig();
  const { t } = useTranslation();

  const donate = () => {
    window.location.href = component.donation.url;
  };
  return (
    component.donation?.url && (
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
    )
  );
};

export default DonateButton;
