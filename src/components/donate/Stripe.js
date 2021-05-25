import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField as LayoutTextField,
  Grid,
  CardHeader,
  Button,
  Container,
  Box,
} from "@material-ui/core";

//import TextField from "../TextField";
// We can't use the goodies of our material ui wrapper, because it triggers too many redraw and sometimes clear the stripe field (credit cards when it shouldn't)

import { loadStripe } from "@stripe/stripe-js";

import { paymentIntent } from "../../lib/stripe";
import { useLayout } from "../../hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import useElementWidth from "../../hooks/useElementWidth";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from "@material-ui/icons/Lock";
import { addActionContact } from "../../lib/server.js";
import ChangeAmount from "./ChangeAmount";

import {
  useStripe,
  Elements,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

import Country from "../Country";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    height: "auto!important",
    width: "100%",
  },
}));

const publishableKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

console.assert(
  typeof publishableKey !== "undefined",
  "you need to set up a REACT_APP_STRIPE_PUBLIC_KEY and proca-donate"
);

const stripe = loadStripe(publishableKey);

const currencies = [
  {
    symbol: "€",
    name: "Euro",
    decimal_digits: 2,
    rounding: 0,
    code: "EUR",
    name_plural: "Euros",
  },
];

const PaymentForm = (props) => {
  const layout = useLayout();
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [data, setData] = useData();
  const form = useForm({
    defaultValues: {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      postcode: data.postcode,
      country: data.country,
    },
  });
  const { control, errors, clearErrors } = form;
  const [compact, setCompact] = useState(true);
  const width = useElementWidth("#proca-donate");

  if ((compact && width > 440) || (!compact && width <= 440))
    setCompact(width <= 440);

  const title = data.amount
    ? config.component?.donation.igive ||
      t("I'm donating") + " " + data.amount + data.currency?.symbol
    : config.component?.Donate?.amount?.title ||
      t("Choose your donation amount");

  const elements = useElements();
  const classes = useStyles();
  const stripe = useStripe();

  if (!data.currency) {
    // TODO: not needed anymore
    const currency = config.component.donation?.currency || {
      symbol: "€",
      code: "EUR",
    };
    setData("currency", currency);
  }

  const onSubmit = async (event, d) => {
    event.preventDefault();
    const values = form.getValues();

    if (!props.stripe || !elements) {
      console.error("Stripe not loaded");
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: values.firstname + " " + values.lastname,
        address: { country: values.country, postal_code: values.postcode },
        email: values.email,
      },
    });

    if (error) {
      console.log("[error]", error); // TODO: log properly
      return;
    }

    const orderComplete = async (paymentIntent) => {
      // TODO: cleanup what information needs to be saved
      const result = await addActionContact("donate", config.actionPage, {
        ...data,
        ...values,
        ...paymentIntent,
      });
      console.log(result);
      props.done(paymentIntent);
    };

    const pi = await paymentIntent({
      amount: data.amount,
      currency: data.currency.code,
      confirm: true,
      payment_method: paymentMethod,
    });

    const result = await stripe.confirmCardPayment(pi.secret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: values.name,
          address: { country: values.country, postal_code: values.postcode },
          email: values.email,
        },
      },
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      // The payment succeeded!
      orderComplete(result.paymentIntent);
      setSuccess("👍");
      return true;
    }
    return false;
  };

  const CustomCardElement = (props) => (
    <CardElement {...props} options={{ hidePostalCode: true }} />
  );
  const StripeCard = (props) => {
    return (
      <Grid item xs={12}>
        <LayoutTextField
          name="card"
          label=""
          variant={layout.variant}
          margin={layout.margin}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            inputComponent: StripeInput,
            inputProps: {
              component: CustomCardElement,
              stripe: props.stripe,
            },
          }}
        />
      </Grid>
    );
  };

  //<form id="proca-donate" onSubmit={handleSubmit(onSubmit)}>
  return (
    <form id="proca-donate" onSubmit={onSubmit}>
      <Container component="main" maxWidth="sm">
        <Box marginBottom={1}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <CardHeader title={title} />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <Controller
                control={control}
                name="firstname"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    label={t("First name")}
                    className={classes.textField}
                    autoComplete="given-name"
                    required
                    error={!!(errors && errors["firstname"])}
                    helperText={
                      errors &&
                      errors["firstname"] &&
                      errors["firstname"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <Controller
                control={control}
                name="lastname"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    label={t("Last name")}
                    className={classes.textField}
                    autoComplete="family-name"
                    required
                    error={!!(errors && errors["lastname"])}
                    helperText={
                      errors && errors["lastname"] && errors["lastname"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="email"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    className={classes.textField}
                    label={t("Email")}
                    autoComplete="email"
                    type="email"
                    placeholder="your.email@example.org"
                    required
                    error={!!(errors && errors["email"])}
                    helperText={
                      errors && errors["email"] && errors["email"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 4}>
              <Controller
                control={control}
                name="postcode"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    className={classes.textField}
                    label={t("Postal Code")}
                    autoComplete="postal-code"
                    error={!!(errors && errors["postcode"])}
                    helperText={
                      errors && errors["postcode"] && errors["postcode"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 8}>
              <Controller
                control={control}
                name="country"
                render={({ onChange, value }) => (
                  <Country
                    form={form}
                    required
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <StripeCard stripe={props.stripe} />
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                size="large"
                startIcon={<LockIcon />}
              >
                {t("Donate")}
              </Button>
            </Grid>
          </Grid>
          <ChangeAmount />
        </Box>
      </Container>
    </form>
  );
};

const PaymentFormWrapper = (props) => {
  const [loadState, setLoadState] = useState({ loading: false, loaded: false });

  return (
    <Container component="main" id="proca-donate">
      <Grid container spacing={1}>
        <Elements stripe={stripe}>
          <PaymentForm stripe={stripe} {...props} />
        </Elements>
      </Grid>
    </Container>
  );
};

export default PaymentFormWrapper;
