import React, { useState, useEffect } from "react";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Box,
  CardMedia,
  CardHeader,
  CardContent,
  FormControl,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  ButtonGroup,
  Typography,
} from "@material-ui/core";
import TextField from "../TextField";
import { useForm } from "react-hook-form";
import useElementWidth from "../../hooks/useElementWidth";

import { useTranslation } from "react-i18next";
import SkipNextIcon from "@material-ui/icons/SkipNext";

const useStyles = makeStyles((theme) => ({
  recurring_choice: {
    width: "100%"
  },
  recurring: {
    margin: theme.spacing(1),
    flex: 1
  },
  amount: {
    width: "5em",
    flex: "1 1 auto",
    flexWrap: "wrap"
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
      flexWrap: "wrap"
    },
  },
}));

const DonateAmount = (props) => {
  //const { t } = useTranslation();
  const classes = useStyles();
  const { t } = useTranslation();

  const config = useCampaignConfig();
  const [data, setData] = useData();
  const selection = config?.component?.donation.amount?.oneoff?.default || [
    3,
    5,
  ];
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
  const currency = config?.component.donation?.currency || {
    symbol: "€",
    code: "EUR",
  };
  if (customAmount && parseFloat(customAmount) !== amount) {
    setData("amount", parseFloat(amount));
    _setAmount(parseFloat(customAmount));
  }

  const setAmount = (amount) => {
    amount = parseFloat(amount);
    setUpdating(true);
    _setAmount(amount);
    setData("amount", amount);
    setData("currency", currency);
    if (custom || customAmount) {
      showCustom(false);
      setValue("amount", null); // reset the custom (other) amount field
    }
  };

  useEffect(() => {
    if (!updating && data.amount && amount !== parseFloat(data.amount)) {
      setAmount(data.amount);
    }
  }, []);

  const width = useElementWidth("#proca-donate");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450)) {
    console.log("width");
    setCompact(width <= 450);
  }
  const title = amount
    ? config?.component?.donation.igive ||
    t("I'm donating {{amount}}", {
      amount: amount.toString() + currency.symbol,
    })
    : config?.component.donation?.title || t("Choose your donation amount");
  //    "I'm donating";

  const average = config.component.donation?.amount?.oneoff?.average;
  const subtitle = average
    ? t("The average donation is {{amount}} {{currency}}", {
      amount: average,
      currency: currency.code,
    })
    : config.component.donation?.subTitle;
  const image = config.component.donation?.image;

  const choosePaymentMethod = (m) => {
    setData("paymentMethod", m);
    props.done();
    ////////////////  props.done();
  };

  const handleRecurring = (event) => {
    console.log("rec", event.target.checked, event.target.name);
  };

  const handleClick = (event, amount) => {
    setAmount(amount);
    if (config.component.donation.external?.url) {
      const fieldmap = {
        firstname: "contact_forename",
        lastname: "contact_surname",
        locality: "contact_place",
        address: "contact_street",
        postcode: "contact_postcode",
        email: "contact_email",
      };
      const params = Object.entries({ ...config.data, ...data }).reduce(
        (p, d) => {
          if (!fieldmap[d[0]]) return "";
          console.log(d, fieldmap[d[0]], p);
          p += "&" + fieldmap[d[0]] + "=" + encodeURIComponent(d[1]);
          return p;
        },
        ""
      );
      window.open(
        config.component.donation.external.url + amount + params,
        "_blank"
      );
    }
  };

  const AmountButton = (props) => {
    return (
      <Button
        color="primary"
        size="large"
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

  const RecurringButton = (props) => {
    return (
      <Button key={props.key}
        className={classes.recurring}
        color="secondary"
        size="large"
        disabled={props.recurring}
        disableElevation={props.recurring}
        variant="contained"
        onChange={handleRecurring}
      >
        {t(props.label)}
      </Button>
    )
  };

  //<div>I'll generously add $0.41 to cover the transaction fees so you can keep 100% of my donation.</div>

  return (
    <Container id="proca-donate">
      <Grid container spacing={1}>
        <CardHeader title={title} subheader={subtitle} />

        {image ? <CardMedia image={image} title={title} /> : null}
        <CardContent>
          <Typography color="textSecondary">
            {t("campaign:donation.intro", {
              defaultValue: "",
              campaign: config.campaign.title,
            })}
          </Typography>
          {config.component.donation?.monthly !== false && (
            <div>
              <ButtonGroup className={classes.recurring_choice}>
                <RecurringButton key="recurring" value="on" label="Monthly" className={classes.recurringLeft} />
                <RecurringButton key="oneoff" value="" label="Just once" className={classes.recurringRight} />
              </ButtonGroup>
            </div>
          )}
          <div className={classes.root}>
            <Grid container spacing={1}>
              {selection.map((d) => (
                <Grid item><AmountButton key={d} amount={d} /></Grid>
              ))}
              <Button
                color="primary"
                name="other"
                onClick={() => showCustom(true)}
              >
                {t("Other")}
              </Button>
            </Grid>
          </div>
          <FormControl fullWidth>
            <FormGroup>

              {custom && (
                <TextField
                  form={form}
                  type="number"
                  label={t("Amount")}
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

          {!config.component.donation.external && (
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
          )}
        </CardContent>

      </Grid>
    </Container>
  );
};
export default DonateAmount;
