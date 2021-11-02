import {
  CardContent,
  Container,
  Grid,
  Typography
} from "@material-ui/core";
import React from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";

const SEPA = ({ formData }) => {
  const IBAN = formData.IBAN.replaceAll(" ", "");
  const { t } = useTranslation();
  return (
    <>
      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("Payment Method")} :{" "}
      </Grid>
      <Grid item xs={6}>
        {t("SEPA Bank Transfer")} :{" "}
      </Grid>

      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("IBAN")} :{" "}
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

const Card = (formData) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("Payment Method")} :{" "}
      </Grid>
      <Grid item xs={6}>
        {t("Card")}
      </Grid>
    </>
  );
};

const PayPal = (formData) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid item xs={12}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={5}>
        {t("Payment Method")} :{" "}
      </Grid>
      <Grid item xs={6}>
        {t("PayPal")}
      </Grid>
    </>
  );
};
const Thanks = (props) => {
  const { t } = useTranslation();
  const donateConfig = useCampaignConfig().component.donation;
  // const classes = useStyles();
  const [formData] = useData();

  return (
    <Container id="proca-donate">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <CardContent>
            <Typography variant="h4" gutterBottom color="textPrimary">
              {t("Thank you for your donation!")}
            </Typography>

            <Grid container spacing={1} alignContent="flex-start">
              <Grid item xs={12}>
                <Typography variant="h6">
                  {t("Donation to WeMove Europe")}
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
                Email :
              </Grid>
              <Grid item xs={6}>
                {formData.email}
              </Grid>

              <Grid item xs={12}></Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={5}>
                Amount :{" "}
              </Grid>
              <Grid item xs={6}>
                {Number(formData.amount).toLocaleString()}{" "}
                {donateConfig.currency.symbol}{" "}
                {formData.frequency !== "oneoff"
                  ? t("a " + formData.frequency)
                  : ""}
              </Grid>

              <Grid item xs={12}></Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={5}>
                Date :{" "}
              </Grid>
              <Grid item xs={6}>
                {new Date().toLocaleDateString()}
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
