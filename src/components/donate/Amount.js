import React, { useState } from "react";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Box,
  CardContent,
  FormControl,
  InputAdornment,
  FormGroup,
  FormHelperText,
  Button,
  ButtonGroup,
  Typography,
  Paper,
  AppBar,
  Tabs,
  Tab,
} from "@material-ui/core";
import TextField from "../TextField";
import { useForm } from "react-hook-form";
import useElementWidth from "../../hooks/useElementWidth";

import { useTranslation } from "react-i18next";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import AmountButton from "./buttons/AmountButton";
import FrequencyButtons from "./buttons/FrequencyButton";
import DonateTitle from "./DonateTitle";

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
    marginTop: theme.spacing(2),
  },
}));

const OtherAmountInput = ({ form, classes, currency, setData }) => {
  const [otherAmountError, setOtherAmountError] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {otherAmountError ? (
        <Grid item xs={12}>
          <FormHelperText error={true}>{otherAmountError}</FormHelperText>
        </Grid>
      ) : (
        ""
      )}
      <TextField
        form={form}
        type="number"
        label={t("Amount")}
        name="amount"
        className={classes.number}
        onChange={(e) => {
          const a = parseFloat(e.target.value);
          if (a && a > 1.0) {
            setData("amount", a);
            setOtherAmountError("");
          } else {
            setOtherAmountError(
              t("Please enter a valid amount greater than 1.0 {{currency}}", {
                currency: currency.symbol,
              })
            );
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">{currency.symbol}</InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true }}
      />
    </>
  );
};

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
    <Container id="proca-donate">
      <Paper square>
        <AppBar position="static" color="default">
          <Tabs
            variant="fullWidth"
            value="amount"
            indicatorColor="primary"
            textColor="primary"
            aria-label="disabled tabs example"
          >
            {" "}
            <Tab
              value="amount"
              label={t("Choose an Amount")}
              aria-label={t("Choose an Amount")}
            />
          </Tabs>
        </AppBar>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DonateTitle
              config={config}
              amount={amount}
              currency={currency}
              frequency={frequency}
            />
          </Grid>
          <Grid item xs={12}>
            <CardContent>
              <Typography color="textSecondary">
                {t("campaign:donation.intro", {
                  defaultValue: "",
                  campaign: config.campaign.title,
                })}
              </Typography>
              <Grid container spacing={1} role="group" aria-label="amount">
                {amounts.map((d) => (
                  <Grid xs={6} md={3} key={d} item>
                    <AmountButton
                      amount={d}
                      currency={currency}
                      onClick={() => toggleCustomField(false)}
                    />
                  </Grid>
                ))}
                <Grid item>
                  <Button
                    color="primary"
                    name="other"
                    onClick={() => toggleCustomField(true)}
                  >
                    {t("Other")}
                  </Button>
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <FormGroup>
                  {showCustomField && (
                    <OtherAmountInput
                      form={form}
                      classes={classes}
                      currency={currency}
                      setData={setData}
                    />
                  )}
                </FormGroup>
              </FormControl>
              {/* <Typography variant="h5" gutterBottom color="textSecondary">
            {t("campaign:donation.frequency.intro", {
              defaultValue: "Make it monthly?",
            })}
          </Typography> */}
              {frequencies.length > 1 ? (
                <FrequencyButtons
                  frequencies={frequencies}
                  selected={frequency}
                  classes={classes}
                />
              ) : null}
            </CardContent>
          </Grid>

          {!config.component.donation.external && (
            <Grid item xs={12}>
              <Box margin={2}>
                <ButtonGroup fullWidth>
                  <Button
                    endIcon={<SkipNextIcon />}
                    fullWidth
                    disabled={!amount}
                    variant="contained"
                    onClick={props.done}
                    color="primary"
                  >
                    {t("Next")}
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};
export default DonateAmount;
