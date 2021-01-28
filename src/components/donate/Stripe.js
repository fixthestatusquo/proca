import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  TextField as LayoutTextField,
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  Container,
  Box,
} from "@material-ui/core";
import TextField from "../TextField";

//import Autocomplete from '@material-ui/lab/Autocomplete';
import { loadStripe } from "@stripe/stripe-js";

import { useLayout } from "../../hooks/useLayout";
import useElementWidth from "../../hooks/useElementWidth";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from "@material-ui/icons/Lock";

import {
  useStripe,
  Elements,
  useElements,
  CardElement,
  IbanElement,
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

const publishableKey =
  "pk_test_51HLPbyFFsfkkXAxwgFLCJfIWJwuNvzA867Arg1lH4Woqhcq0yEWMtCwx4j2lqML9dCPK3oPH0NQyiAPux3K8JZUw00MxrWkh7u";

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

  const [data, setData] = useData();
  const form = useForm({
    defaultValues: {
      name:
        (data.firstname ? data.firstname + " " : "") +
        (data.lastname ? data.lastname : ""),
      email: data.email,
      postcode: data.postcode,
    },
  });

  const [compact, setCompact] = useState(true);
  const width = useElementWidth("#proca-donate");

  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);
  const title = data.amount
    ? config?.component?.donation.igive ||
      t("I'm donating") + " " + data.amount + "€"
    : config?.component?.DonateAmount.title || t("Choose your donation amount");

  const formValues = {};
  const dispatch = (d) => {
    console.log("dispatch", d);
  };
  const elements = useElements();

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!props.stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await props.stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.log("[error]", error);
    } else {
      console.log("[PaymentMethod]", paymentMethod);
    }
  };

  const CustomCardElement = (props) => (
    <CardElement {...props} options={{ style: { hidePostalCode: true } }} />
  );
  const StripeCard = (props) => {
    //hidePostalCode=true
    console.log("draw card", props.stripe);
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
  const StripeIBAN = (props) => {
    //  supportedCountries: ['SEPA'],
    return (
      <Grid item xs={12}>
        <LayoutTextField
          name="IBAN"
          label=""
          variant={layout.variant}
          margin={layout.margin}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            inputComponent: StripeInput,
            inputProps: {
              component: IbanElement,
              stripe: props.stripe,
            },
          }}
        />
      </Grid>
    );
  };

  return (
    <>
      <Container component="main" maxWidth="sm">
        <Box marginBottom={1}>
          <Grid container spacing={1}>
            - <CardHeader title={title} />
            <Grid item xs={12}>
              <TextField
                form={form}
                name="name"
                label={t("Full Name")}
                autoComplete="full-name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 8}>
              <TextField
                form={form}
                name="email"
                type="email"
                label={t("Email")}
                autoComplete="email"
                placeholder="your.email@example.org"
                required
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 4}>
              <TextField
                form={form}
                name="postcode"
                label={t("Postal Code")}
                autoComplete="postal-code"
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
                Donate
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

const PaymentFormWrapper = (props) => {
  const [loadState, setLoadState] = useState({ loading: false, loaded: false });
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    (async function () {
      if (stripe) return;
      const s = await loadStripe(publishableKey);
      setStripe(s);
      console.log("stripe loaded");
    })();

    return () => {
      console.log("cancel stripe");
    };
  }, [stripe, setStripe, publishableKey]);

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
