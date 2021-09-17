import React, { useState } from "react";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import {
  CardContent,
  Container,
  FormControl,
  FormGroup,
  Grid,
  Typography,
} from "@material-ui/core";

import { useForm } from "react-hook-form";
import useElementWidth from "../../hooks/useElementWidth";

import { useTranslation } from "react-i18next";
import AmountButton, { OtherButton } from "./buttons/AmountButton";
import FrequencyButtons from "./buttons/FrequencyButton";
import DonateTitle from "./DonateTitle";
import Steps from "./Stepper";
import PaymentMethodButtons from "./PaymentMethodButtons";
import OtherAmountInput from "./OtherAmount";

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
  frequency: {
    // marginTop: theme.spacing(2),
  },
  container: {
    border: "solid 1px " + theme.palette.primary.dark,
  },
  formContainers: {
    marginBottom: "1em",
  },
  cardHeader: {
    paddingTop: 0,
  },
}));

const DonateAmount = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [data, setData] = useData();

  const donateConfig = config.component.donation;

  // TODO: adjust for currencies?
  const configuredAmounts = donateConfig?.amount || {
    default: [3, 5, 10, 50, 200],
  };

  const frequencies = donateConfig?.frequency?.options || ["oneoff", "monthly"];
  const frequency = data.frequency;

  const amounts = [
    ...(configuredAmounts[frequency] || configuredAmounts["oneoff"]),
  ];

  if (data.initialAmount && !amounts.find((s) => s === data.initialAmount)) {
    amounts.push(data.initialAmount);
  }

  amounts.sort((a, b) => a - b);

  const currency = donateConfig.currency;
  const amount = data.amount;

  const form = useForm();

  const [showCustomField, toggleCustomField] = useState(false);
  const width = useElementWidth("#proca-donate");

  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450)) {
    setCompact(width <= 450);
  }

  return (
    <Container id="proca-donate" className={classes.container}>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Steps /> {/* Hard coded for now */}
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        {donateConfig.useTitle && (
          <Grid item xs={12}>
            <DonateTitle
              config={config}
              amount={amount}
              currency={currency}
              frequency={frequency}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <CardContent className={classes.cardHeader}>
            {config.campaign.title ? (
              <Typography paragraph color="textPrimary">
                {t("campaign:donation.intro", {
                  defaultValue: "",
                  campaign: config.campaign.title,
                })}
              </Typography>
            ) : (
              ""
            )}
            <Typography paragraph gutterBottom color="textPrimary">
              {t("campaign:donation.amount.intro", {
                defaultValue: "Choose an amount :",
              })}
            </Typography>
            <Grid
              container
              className={classes.formContainers}
              spacing={1}
              role="group"
              aria-label="amount"
            >
              {amounts.map((d) => (
                <Grid xs={6} md={3} key={d} item>
                  <AmountButton
                    amount={d}
                    currency={currency}
                    onClick={() => toggleCustomField(false)}
                  />
                </Grid>
              ))}
              <Grid xs={6} md={3} key="other" item>
                <OtherButton
                  onClick={() => toggleCustomField(true)}
                  selected={showCustomField}
                >
                  {t("Other")}
                </OtherButton>
              </Grid>
            </Grid>

            {showCustomField && (
              <FormControl fullWidth>
                <FormGroup>
                  <OtherAmountInput
                    form={form}
                    classes={classes}
                    currency={currency}
                    setData={setData}
                  />{" "}
                </FormGroup>
              </FormControl>
            )}

            {frequencies.length > 1 ? (
              <>
                {" "}
                <Typography paragraph gutterBottom color="textPrimary">
                  {t("campaign:donation.frequency.intro", {
                    defaultValue: "Make it monthly?",
                  })}
                </Typography>
                <FrequencyButtons
                  frequencies={frequencies}
                  selected={frequency}
                  classes={classes}
                />
              </>
            ) : null}

            <Typography paragraph gutterBottom color="textPrimary">
              {t("campaign:donation.paymentMethods.intro", {
                defaultValue: "Checkout :",
              })}
            </Typography>
            {!config.component.donation.external && (
              <PaymentMethodButtons classes={classes} nextStep={props.done} />
            )}
          </CardContent>
        </Grid>
      </Grid>
      {/* </Paper> */}
    </Container>
  );
};
export default DonateAmount;
