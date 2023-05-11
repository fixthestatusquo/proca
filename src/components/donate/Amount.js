import React, { useState } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import { CardContent, Container, Grid, Typography } from "@material-ui/core";

import useElementWidth from "@hooks/useElementWidth";

import { useTranslation } from "react-i18next";
import DonateTitle from "./DonateTitle";
import Steps, { useDonateStep } from "./Stepper";
import PaymentMethodButtons from "./PaymentMethodButtons";
import Frequencies from "./buttons/FrequencyButton";
import Amounts from "./buttons/AmountButton";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  amount: {
    width: "5em",
  },
  number: {
    "& input": {
      "&[type=number]": {
        "-moz-appearance": "textfield",
      },
      "&::-webkit-outer-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },
      "&::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },
    },
  },
  root: {
    "& > *": {
      margin: theme.spacing(0.5),
      fontSize: theme.fontSize * 3,
    },
  },
  container: {
    // border: "solid 1px " + theme.palette.primary.dark,
  },

  // cardHeader: {
  //   paddingTop: 0,
  // },
}));

const DonateAmount = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  const width = useElementWidth("#proca-donate");

  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450)) {
    setCompact(width <= 450);
  }

  const [, setDonateStep] = useDonateStep();
  const [, setData] = useData();
  const [complete, setComplete] = useState(false);

  return (
    <Container id="proca-donate" className={classes.container}>
      {complete && <Alert severity="success">{t("donation.thanks")}</Alert>}

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Steps />
        </Grid>
        {donateConfig.useTitle && (
          <Grid item xs={12}>
            <DonateTitle />{" "}
          </Grid>
        )}
        <Grid item xs={12}>
          <CardContent className={classes.cardHeader}>
            {config.campaign.title ? (
              <Typography variant="h5" paragraph color="textPrimary">
                {t("donation.intro", {
                  campaign: config.campaign.title,
                })}
              </Typography>
            ) : (
              ""
            )}
            <Typography variant="h6" paragraph gutterBottom color="textPrimary">
              {t("donation.amount.intro")}
            </Typography>

            <Amounts />

            <Frequencies />

            <>
              <PaymentMethodButtons
                classes={classes}
                onClickStripe={() => {
                  setData("paymentMethod", "stripe");
                  setDonateStep(1);
                  props.done();
                }}
                onClickSepa={() => {
                  setData("paymentMethod", "sepa");
                  setDonateStep(1);
                  props.done();
                }}
                onComplete={() => {
                  setComplete(true);
                  props.go("donate_Thanks");
                }}
              />
            </>
          </CardContent>
        </Grid>
      </Grid>
      {/* </Paper> */}
    </Container>
  );
};

export default DonateAmount;
