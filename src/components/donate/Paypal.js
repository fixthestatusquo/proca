import React from "react";
import usePaypal from "../../hooks/usePaypal";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "../../hooks/useConfig";

import { Grid, CardHeader, Container, Box } from "@material-ui/core";

const Paypal = (props) => {
  const [data, setData] = useData();
  const config = useCampaignConfig();
  const { t } = useTranslation();
  if (!data.currency) {
    const currency = config?.component.donation?.currency || {
      symbol: "€",
      code: "EUR",
    };
    setData("currency", currency);
  }
  const ButonPaypal = usePaypal({
    currency: data.currency,
    amount: data.amount,
    recurring: data.recurring,
  });
  const title = data.amount
    ? config?.component?.donation.igive ||
      t("I'm donating") + " " + data.amount + "€"
    : config?.component?.Donate?.amount?.title ||
      t("Choose your donation amount");
  return (
    <Container component="main" maxWidth="sm">
      <Box marginBottom={1}>
        <Grid container spacing={1}>
          <CardHeader title={title} />
          <Grid item xs={12}>
            <div id="paypal-container">
              - <ButonPaypal />-{" "}
            </div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Paypal;
