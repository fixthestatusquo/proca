import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField as LayoutTextField,
  Grid,
  Box,
  Button,
  Container,
  FormHelperText,
  CircularProgress,
} from "@material-ui/core";

//import TextField from "../TextField";
// We can't use the goodies of our material ui wrapper, because it triggers too many redraw and sometimes clear the stripe field (credit cards when it shouldn't)

import { loadStripe } from "@stripe/stripe-js";

import { useLayout } from "../../hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import useElementWidth from "../../hooks/useElementWidth";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from "@material-ui/icons/Lock";
import { addDonateContact, stripeCreate } from "../../lib/server.js";
import ChangeAmount from "./ChangeAmount";
import PaymentBox from "./PaymentBox";

import {
  useStripe,
  Elements,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

import Country from "../Country";
import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import DonateTitle from "./DonateTitle";

// TODO - read from the config
const publishableKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

console.assert(
  typeof publishableKey !== "undefined",
  "you need to set up a REACT_APP_STRIPE_PUBLIC_KEY and proca-donate"
);
const stripe = loadStripe(publishableKey);

const stripeErrorAtom = atom({
  key: "stripe-error",
  default: undefined,
});

const stripeCompleteAtom = atom({
  key: "stripe-card-complete",
  default: undefined,
});

// const onError = (errors, e) => console.log(errors, e);

const CustomCardElement = (props) => {
  const setComplete = useSetRecoilState(stripeCompleteAtom);
  return (
    <CardElement
      {...props}
      options={{ hidePostalCode: true }}
      onChange={(e) => setComplete(e.complete)}
    />
  );
};
const StripeCard = (props) => {
  const layout = useLayout();
  const stripe = useStripe();
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
            stripe: stripe,
          },
        }}
      />
    </Grid>
  );
};

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

const PaymentForm = (props) => {
  const layout = useLayout();
  const { t } = useTranslation();
  const config = useCampaignConfig();

  if (!config.component.donation?.stripe?.product_id) {
    throw Error(
      "You must configure a Stripe product id " +
      "[component.donation.stripe.product_id] to use Stripe.");
  }
  const stripeError = useRecoilValue(stripeErrorAtom);
  const [data] = useData();

  const form = props.form;
  const { control, errors } = form;
  const [compact, setCompact] = useState(true);

  const width = useElementWidth("#proca-donate");

  if ((compact && width > 440) || (!compact && width <= 440))
    setCompact(width <= 440);

  const amount = data.amount;
  const frequency = data.frequency;
  const currency = data.currency;

  const classes = useStyles();

  return (
    <form id="proca-donate">
      <Container component="main" maxWidth="sm">
        <PaymentBox>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <DonateTitle
                config={config}
                amount={amount}
                currency={currency}
                frequency={frequency}
              />
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
            {stripeError ? (
              <Grid item xs={12}>
                <FormHelperText error={true}>
                  {stripeError.message}
                </FormHelperText>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </PaymentBox>
      </Container>
    </form>
  );
};

const SubmitButton = (props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const setStripeError = useSetRecoilState(stripeErrorAtom);
  const stripeComplete = useRecoilValue(stripeCompleteAtom);
  const stripe = useStripe();

  const [data] = useData();

  const elements = useElements();

  const { t } = useTranslation();
  const config = useCampaignConfig();

  const onSubmitButtonClick = async (event, _) => {
    const orderComplete = async (paymentIntent) => {
      // TODO: cleanup what information needs to be saved

      const d = { ...data };

      d.donation = {
        amount: data.amount,
        currency: data.currency.code,
        payload: {
          paymentIntent: paymentIntent,
          values: values,
        },
      };
      if (data.frequency) d.donation.frequencyUnit = data.frequency;
      if (config.test) d.donation.payload.test = true;
      // console.log(d);
      await addDonateContact("stripe", config.actionPage, d);
      props.done(paymentIntent);
    };

    event.preventDefault();

    const btn = event.target;
    btn.disabled = true;
    setSubmitting(true);

    if (!stripeComplete) {
      setStripeError({ message: t("Please provide your card information.") });
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const values = props.form.getValues();

    if (!props.stripe || !elements) {
      console.error("Stripe not loaded");
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const cardElement = elements.getElement(CardElement);

    let params = {
      actionPage: config.actionPage,
      amount: data.amount,
      currency: data.currency.code,
      contact: {
        name: data.firstname + " " + data.lastname,
        email: data.email,
        address: { country: data.country, postal_code: data.postcode },
      },
      stripe_product_id: config.component.donation.stripe.product_id,
    };
    if (data.frequency === "monthly") params.frequency = "month";

    const piResponse = await stripeCreate(params);
    console.log("response", piResponse, piResponse.client_secret);

    /*
    const piResponse = await stripeCreatePaymentIntent(
      config.actionPage,
      data.amount,
      data.currency.code
      // { idempotency_key: stripeSessionId }
    );
*/
    if (piResponse.errors) {
      console.log("Error returned from proca backend", piResponse.errors);
      setStripeError({
        message: t(
          "We couldn't handle your donation at the moment. Please try again in a few minutes."
        ),
      });
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const stripeResponse = await stripe.confirmCardPayment(
      piResponse.client_secret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.name,
            address: { country: values.country, postal_code: values.postcode },
            email: values.email,
          },
        },
      }
    );

    if (stripeResponse.error) {
      console.log("error", stripeResponse);
      setStripeError(stripeResponse.error);
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    orderComplete(stripeResponse.paymentIntent);

    // leave button disabled - we're done!
    return true;
  };

  return (
    <Box mt={2}>
      <Button
        className="submit-button"
        name="submit"
        color="primary"
        variant={
          config.layout?.button?.submit?.variant ||
          config.layout?.button?.variant ||
          "contained"
        }
        fullWidth
        type="submit"
        size="large"
        startIcon={isSubmitting ? undefined : <LockIcon />}
        onClick={(e, data) => {
          onSubmitButtonClick(e, data);
        }}
      >
        {isSubmitting ? (
          <CircularProgress />
        ) : (
          t("Donate {{amount}}{{currency.symbol}} {{frequency}}", {
            amount: data.amount,
            currency: data.currency,
            frequency: t("a " + data.frequency),
          })
        )}
      </Button>
    </Box>
  );
};

const PayWithStripe = (props) => {
  // const stripe = useStripe();
  const form = props.form;
  return (
    <Grid container>
      <Grid item xs={12}>
        <PaymentForm stripe={stripe} form={form} {...props} />
      </Grid>
      <Grid item xs={12}>
        <StripeCard stripe={stripe} />
      </Grid>
      <Grid item xs={12}>
        <SubmitButton stripe={stripe} form={form} {...props} />
      </Grid>
      <Grid item xs={12}>
        <ChangeAmount />
      </Grid>
    </Grid>
  );
};

const PaymentFormWrapper = (props) => {
  const config = useCampaignConfig();

  const [data] = useData();

  const form = useForm({
    defaultValues: {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      postcode: data.postcode,
      country: data.country,
    },
  });

  return (
    <Container component="main" id="proca-donate">
      <Elements stripe={stripe} options={config?.lang || "auto"}>
        <PayWithStripe {...props} form={form} />
      </Elements>
    </Container>
  );
};

export default PaymentFormWrapper;
