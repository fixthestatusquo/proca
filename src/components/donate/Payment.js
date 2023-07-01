import React, { useState } from "react";
import Container from "@mui/material/Container";
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";

import Stripe from "./Stripe";
import Sepa from "./Sepa";
import useData from "../../hooks/useData.js";
import { CardContent, Grid } from "@mui/material";
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
