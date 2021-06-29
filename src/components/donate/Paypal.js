import React from "react";
import usePaypal from "../../hooks/usePaypal";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";

import { Grid, Container } from "@material-ui/core";
import ChangeAmount from "./ChangeAmount";
import PaymentBox from "./PaymentBox";
import DonateTitle from "./DonateTitle";

const Paypal = (props) => {
  const [data] = useData();
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const ButtonPaypal = usePaypal({
    currency: donateConfig.currency,
    amount: data.amount,
    recurring: data.recurring,
  });

  return (
    <Container component="main" maxWidth="sm">
      <PaymentBox>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DonateTitle
              config={config}
              amount={data.amount}
              currency={donateConfig.currency}
              frequency={data.frequency}
            />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <div id="paypal-container">
              - <ButtonPaypal />-{" "}
            </div>
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
        <ChangeAmount />
      </PaymentBox>
    </Container>
  );
};

export default Paypal;
