import React from "react";
import useData from "@hooks/useData";

import { Button, Grid } from "@material-ui/core";

import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
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
      .replace("{email}", formData.firstname)
      .replace("{lastname}", formData.firstname)
      .replace("{firstname}", formData.firstname)
      .replace("{amount}", formData.amount);
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
        <PaymentIcon />
        {t("donation.payment_methods.card", { defaultvalue: "Card" })}
      </Button>
    </Grid>
  );
};

export default ExternalPayment;
