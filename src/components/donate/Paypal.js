import React, { useState } from "react";
import usePaypal from "../../hooks/usePaypal";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";

import { Grid, FormHelperText } from "@material-ui/core";

const Paypal = ({ classes, done }) => {
  const [formData] = useData();
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const [errorFromPaypal, seterrorFromPaypal] = useState();

  const ButtonPaypal = usePaypal({
    currency: donateConfig.currency,
    amount: formData.amount,
    recurring: formData.recurring,
    completed: (response) => {
      done(response);
    },
    failed: (e) => {
      seterrorFromPaypal(e);
    },
    formData: formData,
  });

  console.log("WTF PayPal");

  return (
    <>
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
    </>
  );
};

export default Paypal;
