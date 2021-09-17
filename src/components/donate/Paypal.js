import React, { useState } from "react";
import usePaypal from "../../hooks/usePaypal";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";

import { Grid, Container, FormHelperText } from "@material-ui/core";
import PaymentBox from "./PaymentBox";
import DonateTitle from "./DonateTitle";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  messages: {
    fontSize: "1rem",
    lineHeight: "1.4",
    marginBottom: "25px",
  },
}));

const Paypal = (props) => {
  const [formData] = useData();
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const [errorFromPaypal, seterrorFromPaypal] = useState();
  const classes = useStyles();

  const ButtonPaypal = usePaypal({
    currency: donateConfig.currency,
    amount: formData.amount,
    recurring: formData.recurring,
    completed: (response) => {
      props.done(response);
    },
    failed: (e) => {
      seterrorFromPaypal(e);
    },
    formData: formData,
  });

  return (
    <Container component="main" maxWidth="sm">
      <PaymentBox>
        <Grid container spacing={1}>
          {donateConfig.useTitle && (
            <Grid item xs={12}>
              <DonateTitle
                config={config}
                amount={formData.amount}
                currency={donateConfig.currency}
                frequency={formData.frequency}
              />
            </Grid>
          )}

          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            {errorFromPaypal ? (
              <Grid item xs={12}>
                <FormHelperText className={classes.messages} error={true}>
                  {errorFromPaypal.message}
                </FormHelperText>
              </Grid>
            ) : null}
            <div id="paypal-container">
              - <ButtonPaypal />-{" "}
            </div>
          </Grid>
        </Grid>
      </PaymentBox>
    </Container>
  );
};

export default Paypal;
