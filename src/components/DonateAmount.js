import React, { useState, useEffect } from "react";
import { useCampaignConfig } from "../hooks/useConfig";
import useData from "../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardMedia,
  CardHeader,
  CardActions,
  CardContent,
  FormControl,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  ButtonGroup,
} from "@material-ui/core";
import TextField from "./TextField";
import { useForm } from "react-hook-form";
import useElementWidth from "../hooks/useElementWidth";

import { useTranslation } from "react-i18next";
import PaymentIcon from "@material-ui/icons/Payment";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import usePaypal from "../hooks/usePaypal";

const useStyles = makeStyles((theme) => ({
  amount: { width: "5em" },
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
    },
  },
}));

const DonateAmount = (props) => {
  //const { t } = useTranslation();
  const classes = useStyles();
  const { t } = useTranslation();

  const config = useCampaignConfig();
  const [data, setData] = useData();
  const selection = config?.component?.donation?.oneoff?.default || [3, 5];
  const form = useForm({
    defaultValues: {
      amount: selection.find((selected) => selected === parseFloat(data.amount))
        ? null
        : parseFloat(data.amount),
    },
  });
  const { setValue, watch } = form;

  const [recurring, setRecurring] = useState(data.recurring);
  const [amount, _setAmount] = useState(data.amount);
  const [updating, setUpdating] = useState(false);
  const [custom, showCustom] = useState(() => {
    if (amount === null) return false;
    const found = selection.find((selected) => selected === amount);
    return found;
  });
  const customAmount = watch("amount");
  if (customAmount && parseFloat(customAmount) !== amount) {
    setData("amount", parseFloat(amount));
    _setAmount(parseFloat(customAmount));
  }

  const setAmount = (amount) => {
    amount = parseFloat(amount);
    setUpdating(true);
    _setAmount(amount);
    setData("amount", amount);
    if (custom || customAmount) {
      showCustom(false);
      setValue("amount", null); // reset the custom (other) amount field
    }
  };

  useEffect(() => {
    if (!updating && data.amount && amount !== parseFloat(data.amount)) {
      setAmount(data.amount);
    }
  });

  const width = useElementWidth("#proca-donate");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);
  const currency = config?.component?.donation.currency || {
    symbol: "€",
    code: "EUR",
  };
  const title = amount
    ? config?.component?.donation.igive ||
      "I'm donating" + " " + amount.toString() + currency.symbol
    : config?.component?.donation.title || t("Choose your donation amount");
  //    "I'm donating";

  // todo: not hardcoded, and useIntl.NumberFormat
  const subtitle =
    config?.component?.donation.subTitle ||
    t("The average donation is {{amount}}", { amount: "8.60" });
  const image = config?.component?.donation.image;

  const ButonPaypal = usePaypal({
    currency: currency,
    amount: amount,
    recurring: recurring,
  });
  const choosePaymentMethod = (m) => {
    setData("paymentMethod", m);
    props.done();
    ////////////////  props.done();
  };

  const handleRecurring = (event) => {
    //  setRecurring(
    console.log("rec", event.target.checked, event.target.name);
  };

  const handleClick = (event, amount) => {
    setAmount(amount);
    if (config.component.donation.external?.url)
      window.open(config.component.donation.external.url + amount, "_blank");
  };

  const AmountButton = (props) => {
    return (
      <Button
        color="primary"
        disabled={amount === props.amount}
        disableElevation={amount === props.amount}
        variant="contained"
        className={classes.amount}
        onClick={(e) => handleClick(e, props.amount)}
      >
        {props.amount}&nbsp;{currency.symbol}
      </Button>
    );
  };

  return (
    <Card id="proca-donate">
      <CardHeader title={title} subheader={subtitle} />

      {image ? <CardMedia image={image} title={title} /> : null}
      <CardContent>
        <div className={classes.root}>
          {selection.map((d) => (
            <AmountButton key={d} amount={d} />
          ))}
          <Button color="primary" name="other" onClick={() => showCustom(true)}>
            {t("Other")}
          </Button>
        </div>
        <FormControl fullWidth>
          <FormGroup>
            {config.component.donation?.monthly !== false && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurring}
                    onChange={handleRecurring}
                    name="monthly"
                    color="primary"
                  />
                }
                label={t("Monthly donations")}
              />
            )}
            {custom && (
              <TextField
                form={form}
                type="number"
                label="Amount"
                name="amount"
                className={classes.number}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {currency.symbol}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </FormGroup>
        </FormControl>
      </CardContent>
      {!config.component.donation.external && (
        <CardActions>
          <ButtonGroup
            variant="contained"
            fullWidth={compact}
            aria-label="Select Payment method"
            orientation={compact ? "vertical" : "horizontal"}
          >
            <Button
              color="primary"
              disabled={!amount}
              startIcon={<PaymentIcon />}
              onClick={() => {
                choosePaymentMethod("creditcard");
              }}
            >
              Credit Card
            </Button>
            <Button
              disabled={!amount}
              onClick={() => choosePaymentMethod("sepa")}
              startIcon={<AccountBalanceIcon />}
            >
              SEPA
            </Button>
            <Button component="div" disabled={!amount} id="paypal-container">
              <ButonPaypal />
            </Button>
          </ButtonGroup>
        </CardActions>
      )}
    </Card>
  );
};
export default DonateAmount;
