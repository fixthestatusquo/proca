import React from "react";
import useData from "@hooks/useData";

import { Button, Grid } from "@material-ui/core";

//import PaymentIcon from "@material-ui/icons/Payment";
import DonationIcon from "@images/Donate";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const ExternalPayment = (props) => {
  const { t } = useTranslation();
  const classes = props.classes;
  const [formData] = useData();
  //  const frequency = formData.frequency;
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  const onClickExternal = () => {
    console.log(config);
    const url = donateConfig.external.url
      .replace("{lang}", config.lang)
      .replace("{email}", formData.email || "")
      .replace("{lastname}", formData.lastname || "")
      .replace("{firstname}", formData.firstname || "")
      .replace("{postcode}", formData.postcode || "")
      .replace("{locality}", formData.locality || "")
      .replace("{amount}", formData.amount || "")
      .replace("{amountcent}", formData.amount ? formData.amount * 100 : "");
    window.open(url, "_blank");
  };

  return (
    <Grid item xs={12}>
      <Button
        size="large"
        fullWidth
        variant="contained"
        color="primary"
        classes={{ root: classes.button }}
        onClick={onClickExternal}
      >
        <DonationIcon />
        {t("donation.payment_methods.default", "Donate")}
      </Button>
    </Grid>
  );
};

export default ExternalPayment;
