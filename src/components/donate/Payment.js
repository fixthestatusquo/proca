import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

import Stripe from "./Stripe";
import Sepa from "./Sepa";
import { useCampaignConfig } from "../../hooks/useConfig.js";
import useData from "../../hooks/useData.js";
import { create as createURL } from "../../lib/urlparser.js";
import { CardContent, Grid } from "@material-ui/core";
import Steps from "./Stepper";


export default function Payment(props) {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [requestData] = useData();

  const done = (d) => {
    // console.log(d);

    if (config?.completed_redirect_url) {
      window.location = createURL(
        window.location,
        config.completed_redirect_url,
        {
          firstName: requestData.firstName,
          amount: requestData.amount,
          currency: requestData.currency.code,
        }
      );
    }

    setSubmitted(true);

    props.done(d);
  };

  const paymentMethod = requestData.paymentMethod || "stripe";

  return (
    <Container>
      {submitted && <Alert severity="success">{t("Thanks!")}</Alert>}

      <Grid container spacing={1}>
        <Grid item xs={12} justifyContent="center">

          <Steps />
        </Grid>
        <Grid item xs={12}>
          <CardContent>
            {paymentMethod === "stripe" && <Stripe done={done} />}
            {paymentMethod === "sepa" && <Sepa done={done} />}
          </CardContent>
        </Grid>
      </Grid>
    </Container>
  );
}
