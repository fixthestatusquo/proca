import { CardContent, Container, Grid, Typography } from "@mui/material";
import React from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useFormatMoney } from "@hooks/useFormatting.js";

const SEPA = ({ formData }) => {
  const { t } = useTranslation();
  const IBAN = formData.IBAN.replaceAll(" ", "");
  return (
    <>
      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("donation.payment_methods.title")}
      </Grid>
      <Grid item xs={6}>
        {t("donation.payment_methods.sepa")}
      </Grid>

      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("donation.iban")}
      </Grid>
      <Grid item xs={6}>
        {formData.paymentMethod === "sepa" &&
          IBAN.substring(0, 2) +
            " ............ " +
            IBAN.substring(IBAN.length - 5, IBAN.length - 2)}
      </Grid>
    </>
  );
};

const Card = () => {
  const { t } = useTranslation();

  return (
    <>
      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("donation.payment_methods.title")}
      </Grid>
      <Grid item xs={6}>
        {t("donation.payment_methods.card")}
      </Grid>
    </>
  );
};

const PayPal = () => {
  const { t } = useTranslation();

  return (
    <>
      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("donation.payment_methods.title")}
      </Grid>
      <Grid item xs={6}>
        {t("donation.payment_methods.paypal")}
      </Grid>
    </>
  );
};
const Thanks = () => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [formData] = useData();
  const formatMoneyAmount = useFormatMoney();
  return (
    <Container id="proca-donate">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <CardContent>
            <Typography variant="h4" gutterBottom color="textPrimary">
              {t("donation.thanks")}
            </Typography>

            <Grid container spacing={1} alignContent="flex-start">
              <Grid item xs={12}>
                <Typography variant="h6">
                  {t("donation.to", { organisation: config.organisation })}
                </Typography>
              </Grid>

              <Grid item xs={12}></Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={5}>
                Name :
              </Grid>
              <Grid item xs={6}>
                {formData.firstname} {formData.lastname}
              </Grid>

              <Grid item xs={12}></Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={5}>
                Email
              </Grid>
              <Grid item xs={6}>
                {formData.email}
              </Grid>

              <Grid item xs={12}></Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={5}>
                Amount
              </Grid>
              <Grid item xs={6}>
                {formData.frequency !== "oneoff"
                  ? t(
                      "donation.frequency.each." +
                        formData.frequency /* i18next-extract-disable-line */,
                      { amount: formatMoneyAmount(formData.amount) }
                    )
                  : ""}
              </Grid>

              <Grid item xs={12}></Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={5}>
                Date
              </Grid>
              <Grid item xs={6}>
                {new Date().toLocaleDateString(config.locale)}
              </Grid>

              {formData.paymentMethod === "sepa" && (
                <SEPA formData={formData} />
              )}
              {formData.paymentMethod === "stripe" && (
                <Card formData={formData} />
              )}
              {formData.paymentMethod === "paypal" && (
                <PayPal formData={formData} />
              )}
            </Grid>
          </CardContent>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Thanks;
