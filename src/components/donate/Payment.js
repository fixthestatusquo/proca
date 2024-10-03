import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

import Stripe from "./Stripe";
import Sepa from "./Sepa";
import useData from "../../hooks/useData.js";
import { CardContent, Grid } from "@material-ui/core";
import Steps from "./Stepper";

export default function Payment(props) {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const [requestData] = useData();

  const done = (d) => {
    setSubmitted(true);
    props.done(d);
  };

  const paymentMethod = requestData.paymentMethod || "stripe";

  return (
    <Container>
      {submitted && <Alert severity="success">{t("donation.thanks")}</Alert>}

      <Grid container spacing={1} justifyContent="center">
        <Grid item xs={12}>
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
