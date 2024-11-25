import React, {useEffect} from "react";
import useData from "@hooks/useData";
import { addAction } from "@lib/server";
import {utm} from "@lib/urlparser";
import dispatch from "@lib/event";
import uuid from "@lib/uuid";

import { Button, Grid } from "@material-ui/core";

//import PaymentIcon from "@material-ui/icons/Payment";
import DonationIcon from "@images/Donate";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const ExternalPayment = props => {
  const { t } = useTranslation();
  const classes = props.classes;
  const [formData] = useData();
  //  const frequency = formData.frequency;
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  useEffect ( ()=> {
    if (!formData.amount || formData.amount === true) return;
    onClickExternal();
      
  },[formData.amount]);

  const addDonate = (event, amount) => {
    const d = {
      uuid: uuid(),
      payload: { amount: amount},
      tracking: utm(),
    };

    dispatch(event.replace("_", ":"), d, null, config);
    addAction(config.actionPage, event, d, config.test);
  };

  const onClickExternal = () => {
    addDonate("donate", formData.amount);
    const url = donateConfig.external.url
      .replace("{lang}", config.lang)
      .replace("{email}", formData.email || "")
      .replace("{lastname}", formData.lastname || "")
      .replace("{firstname}", formData.firstname || "")
      .replace("{postcode}", formData.postcode || "")
      .replace("{locality}", formData.locality || "")
      .replace("{country}", formData.country || "")
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
        disabled={!formData.amount}
        classes={{ root: classes.button }}
        onClick={onClickExternal}
      >
        <DonationIcon />
        {t( "action.donate", "Donate")}
      </Button>
    </Grid>
  );
};

export default ExternalPayment;
