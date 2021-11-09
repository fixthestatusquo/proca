import React, { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField as LayoutTextField,
  Grid,
  Box,
  Button,
  Container,
  FormHelperText,
  CircularProgress,
  Typography
} from "@material-ui/core";
import {stepUrl} from '../../lib/urlparser';

//import TextField from "../TextField";
// We can't use the goodies of our material ui wrapper, because it triggers too many redraw and sometimes clear the stripe field (credit cards when it shouldn't)

//import { loadStripe } from "@stripe/stripe-js";
import useScript from "react-script-hook";

import { useLayout } from "../../hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import useElementWidth from "../../hooks/useElementWidth";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from "@material-ui/icons/Lock";
import { addDonateContact, stripeCreate, removeNullValues } from "../../lib/server.js";
import dispatch from "../../lib/event.js";

import {
  useStripe,
  Elements,
  useElements,
  CardElement,
  P24BankElement
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

import Country from "../Country";
import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import DonateTitle from "./DonateTitle";
import { NameField } from "../NameField";

const STRIPE_FREQUENCY = {
  monthly: "month",
  weekly: "week",
  daily: "day",
  yearly: "year",
};

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
  // XXX pass props.setComplete from parent
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
    <Container component="main" maxWidth="sm">
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
    </Container>
  );
};

const StripeBankSelect = (props) => {
  const layout = useLayout();
  const stripe = useStripe();
  const { t } = useTranslation();

  return (
    <Container component="main" maxWidth="sm">
      <Grid item xs={12}>
        <LayoutTextField
          name="p24"
          label=""
          variant={layout.variant}
          margin={layout.margin}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            inputComponent: StripeInput,
            inputProps: {
              component: P24BankElement,
              stripe: stripe,
            },
          }}
        />

        <p dangerouslySetInnerHTML={{__html: t("campaign:donation.stripe.p24_legal")}}>
        </p>
      </Grid>
    </Container>
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
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const PaymentForm = (props) => {
  const layout = useLayout();
  const { t } = useTranslation();
  const config = useCampaignConfig();

  if (!config.component.donation?.stripe?.productId) {
    throw Error(
      "You must configure a Stripe product id " +
      "[component.donation.stripe.productId] to use Stripe."
    );
  }
  const stripeError = useRecoilValue(stripeErrorAtom);
  const [data, setData] = useData();

  const form = props.form;
  const { control, errors } = form;
  const [compact, setCompact] = useState(true);

  const width = useElementWidth("#proca-donate");

  if ((compact && width > 440) || (!compact && width <= 440))
    setCompact(width <= 440);

  const amount = data.amount;
  const frequency = data.frequency;
  const currency = config.component.donation.currency;
  const useTitle = config.component.donation.useTitle;

  const classes = useStyles();

  return (
    <Container component="main" maxWidth="sm">
      <Grid container spacing={1}>
        {useTitle && (
          <Grid item xs={12}>
            <DonateTitle
              config={config}
              amount={amount}
              currency={currency}
              frequency={frequency}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={compact ? 12 : 6}>
          <NameField
            form={form}
            classes={classes}
            name="firstname"
            label={t("First name")}
            autoComplete="given-name"
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 6}>
          <NameField
            form={form}
            classes={classes}
            name="lastname"
            label={t("Last name")}
            autoComplete="family-name"
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="email"
            // KISS for email validation - something@something\.something
            rules={{ required: true, pattern: /^(.+)@(.+)\.(.+)$/ }}
            render={({ onChange, onBlur, value }) => (
              <LayoutTextField
                className={classes.textField}
                label={t("Email")}
                autoComplete="email"
                type="email"
                name="email"
                placeholder="your.email@example.org"
                required
                error={!!(errors && errors["email"])}
                helperText={
                  errors && errors["email"] && errors["email"].message
                }
                variant={layout.variant}
                margin={layout.margin}
                onChange={onChange}
                onBlur={(e) => {
                  setData(e.target.name, e.target.value);
                  onBlur(e);
                }}
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
            rules={{ required: true }}
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
    </Container>
  );
};

const useStripeRedirectParams = () => {
  const u = new URL(window.location);
  const p = u.searchParams;

  const status = p.get('redirect_status');
  const paymentIntentId = p.get('payment_intent');
  const paymentSecret = p.get('payment_intent_client_secret');

  return {
    isRedirect: status && paymentIntentId && paymentSecret,
    status,
    paymentIntentId,
    paymentSecret
  };
};

/*
 * Refactor plan:
 * - we want SubmitButton to be smaller
 * - I have already wrapped callbacks in useCallback - and listed the deps there
 *
 */

const SubmitButton = (props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const setStripeError = useSetRecoilState(stripeErrorAtom);
  // XXX make a prop
  const stripeComplete = useRecoilValue(stripeCompleteAtom);
  const stripe = useStripe(); // global stripe state

  const [formData] = useData();

  const elements = useElements();

  const { t } = useTranslation();
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;

  const orderComplete = useCallback(async (paymentIntent, paymentConfirm) => {
    const values = props.form.getValues();
    const procaRequest = { ...formData, ...values };

    const confirmedIntent = removeNullValues(paymentConfirm.paymentIntent);
    delete confirmedIntent.client_secret; // Stripe API guide strongly asks for this.

    const payload = {
      paymentIntent: confirmedIntent
    };
    procaRequest.donation = {
      amount: confirmedIntent.amount,
      currency: confirmedIntent.currency.toUpperCase(),
    };

    if (formData.frequency !== "oneoff" && paymentIntent) {
      const intentResponse = paymentIntent.response;
      const subscriptionPlan = intentResponse.items.data[0].plan;

      procaRequest.donation.frequencyUnit = subscriptionPlan.interval;
      payload.subscriptionId = intentResponse.id;
      payload.subscriptionPlan = subscriptionPlan;
      payload.customerId = intentResponse.customer;
    }

    procaRequest.donation.payload = payload;

    if (config.test) payload.test = true;

    const procaResponse = await addDonateContact(
      "stripe",
      config.actionPage,
      procaRequest
   );

    if (procaResponse.errors) {
      throw Error("Proca didn't like the request !", procaResponse.errors);
    }

    // console.log("procaResponse", procaResponse);

    dispatch(
      "donate:complete",
      {
        payment: "stripe",
        uuid: procaResponse.contactRef,
        test: !!config.test,
        firstname: formData.firstname,
        amount: formData.amount,
        currency: currency.code,
        frequency: formData.frequency || "oneoff",
        country: formData.country,
      },
      procaRequest
    );

    props.done(paymentConfirm);
  }, [props, config, currency, formData]);


  const onSubmitButtonClick = useCallback(async (event, _) => {

    event.preventDefault();

    const btn = event.target;
    btn.disabled = true;
    setSubmitting(true);

    const {method, form} = props;
    form.trigger();
    if (Object.keys(form.errors).length > 0) {
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    // For the card input, we wait until it is changed, and then set the stripeComplete
    if (method === 'card' && !stripeComplete) {
      setStripeError({ message: t("Please provide your card information.") });
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const values = form.getValues();

    if (!props.stripe || !elements) {
      console.error("Stripe not loaded");
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const cardElement = elements.getElement(CardElement);
    const p24Element = elements.getElement(P24BankElement);

    let params = {
      actionPage: config.actionPage,
      amount: Math.floor(formData.amount * 100),
      currency: currency.code,
      contact: {
        name: formData.firstname + " " + formData.lastname,
        email: formData.email,
        address: { country: formData.country, postal_code: formData.postcode },
      },
      stripe_product_id: config.component.donation.stripe.productId,
      paymentMethod: method
    };
    if (formData.frequency)
      params.frequency = STRIPE_FREQUENCY[formData.frequency];

    const piResponse = await stripeCreate(params);

    // this has the subscription ID in it
    console.debug(
      "stripe payment intent response",
      piResponse,
      piResponse.client_secret
    );

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

    const billing_details = {
      name: values.name,
      address: { country: values.country, postal_code: values.postcode },
      email: values.email,
    };
    let stripeResponse;

    switch (method) {
      case 'card':
        stripeResponse = await stripe.confirmCardPayment(
          piResponse.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: billing_details
            },
            // expand: {},
          }
        );
        break;
      case 'p24':
        stripeResponse = await stripe.confirmP24Payment(
          piResponse.client_secret,
          {
            payment_method: {
              p24: p24Element,
              billing_details: billing_details
            },
            payment_method_options: {
              p24: {
                tos_shown_and_accepted: true
              }
            },
            return_url: stepUrl('donate/Payment', {
              paymentMethod: 'stripe/p24',
              ...formData,
              ...values
            })
          }
        );
        break;
      default:
        throw new Error(`Stripe: unsupported payment method ${method}`);
    }

    if (stripeResponse.error) {
      console.log("error", stripeResponse);
      setStripeError(stripeResponse.error);
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    console.debug("stripe confirm card payment response", stripeResponse);

    // for p24 order is completed after the redirect
    if (method === 'card') {
      // XXX await missing here?
      orderComplete(piResponse, stripeResponse);
    }

    // leave button disabled - we're done!
    return true;
  }, [stripe, props,currency, setStripeError, stripeComplete, elements, config, formData, orderComplete, t]);

  /* run when we have returned from Stripe payment */
  const onRedirectFromPayment = useCallback(async (clientSecret) => {
    const {paymentIntent, error} = await stripe.retrievePaymentIntent(clientSecret);

    if (error) {
      setStripeError(error);
    } else {
      // first argument is used to pass the initial payment intent in case of regular payments
      // we do not have it here, because we came back from redirect, we only pass the retrieved
      // paymentIntent, which is equivalent to one returned from confirmCardPayment()
      return await orderComplete(undefined, {paymentIntent});
    }
  }, [stripe, orderComplete, setStripeError]);

  /* Check if we are back from Stripe redirection */
  const stripeRedirect = useStripeRedirectParams();
  useEffect(() => {
    if (stripe && stripeRedirect.isRedirect && stripeRedirect.paymentSecret) {
      switch (stripeRedirect.status) {
        case 'succeeded':
          onRedirectFromPayment(stripeRedirect.paymentSecret);
          break;
        case 'failed':
          stripe.retrievePaymentIntent(stripeRedirect.paymentSecret).then(x => console.log('failed payment intent', x));
          setStripeError({message: t("Failed to make the donation. Try again.")});
          console.log("ERROR after redirect");
          break;
        case 'pending':
          stripe.retrievePaymentIntent(stripeRedirect.paymentSecret).then(x => console.log('pending payment', x));
          break;
        default:
      }
    }

  }, [stripe, stripeRedirect, onRedirectFromPayment, setStripeError, t])

  /* Render button */
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
          <CircularProgress color="inherit" />
        ) : (
          t("campaign:donation.stripe.submit", {
            amount: formData.amount,
            currency: currency,
            frequency: t(
              "a " + formData.frequency
            ) /* i18next-extract-disable-line */,
          })
        )}
      </Button>
    </Box>
  );
};

const submitButtonStyles = makeStyles((theme) => ({
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const PayWithStripe = (props) => {
  // XXX add a state for if stripe data is colleted
  // const stripe = useStripe();
  const {form, method} = props;
  const classes = submitButtonStyles();
  return (
    <form id="proca-donate">
      <Grid container>
        <Grid item xs={12}>
          <PaymentForm stripe={props.stripe} form={form} {...props} />
        </Grid>
        {method === 'card' &&
         <Grid item xs={12}>
          <StripeCard stripe={props.stripe} />
         </Grid>
        }
        {method === 'p24' &&
         <Grid item xs={12}>
          <StripeBankSelect stripe={props.stripe} />
         </Grid>
        }
        <Grid item xs={12} classes={{ root: classes.submitButton }}>
          <SubmitButton stripe={props.stripe} method={method} form={form} {...props} />
        </Grid>
      </Grid>
    </form>
  );
};

/*
 * Props:
 * method - the selected payment method (default 'card')
 */
const PaymentFormWrapper = (props) => {
  const method = props.method || 'card';
  const config = useCampaignConfig();

  const [data] = useData();
  const publishableKey =
    config.component.donation?.stripe?.publicKey ||
    process.env.REACT_APP_STRIPE_PUBLIC_KEY;

  const [stripe, loadStripe] = useState(null);
  const [, error] = useScript({
    src: "https://js.stripe.com/v3/",
    onload: () => {
      // the object window.Stripe exists
      loadStripe(window.Stripe(publishableKey));
    },
  });

  const form = useForm({
    defaultValues: {
      firstname: data.firstname || "",
      lastname: data.lastname || "",
      email: data.email || "",
      postcode: data.postcode || "",
      country: data.country || "",
    },
  });

  const { t } = useTranslation();

  if (error) return <h3>Failed to load Stripe API: {error.message}</h3>;

  return (
    <Container component="main" id="proca-donate">
      <Typography variant="h6" gutterBottom color="textPrimary">
        {t("campaign:donation.stripe.intro", {
          defaultValue: "Payment details :",
        })}
      </Typography>
      <Elements stripe={stripe} options={{locale: config?.lang || "auto"}}>
        <PayWithStripe {...props} method={method} form={form} stripe={stripe} />
      </Elements>
    </Container>
  );
};

export default PaymentFormWrapper;
